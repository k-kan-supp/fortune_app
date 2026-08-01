"""ログの契約を固定するテスト。

このアプリのログには、生年月日・チャット本文・メールアドレス・トークンが
決して載ってはいけない。ここが緩むと個人情報がログ基盤へ流れ出るので、
「出ないこと」を明示的に検証する。
"""

import json
import logging

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.logging import (
    JsonFormatter,
    TextFormatter,
    mask_email,
    request_id_var,
)
from app.core.middleware import RequestLoggingMiddleware
from app.core.security import create_access_token, decode_access_token


def _record(**extra: object) -> logging.LogRecord:
    record = logging.LogRecord(
        name="app.test", level=logging.INFO, pathname=__file__, lineno=1,
        msg="hello", args=None, exc_info=None,
    )
    for key, value in extra.items():
        setattr(record, key, value)
    return record


# --- メールのマスク -------------------------------------------------------


def test_mask_email_keeps_only_the_first_character_and_domain():
    assert mask_email("ren@example.com") == "r***@example.com"
    assert mask_email("a@b.jp") == "a***@b.jp"


def test_mask_email_handles_malformed_input():
    # ログのために例外を出したくないので、壊れた入力も潰して返す
    assert mask_email("not-an-email") == "***"
    assert mask_email("") == "***"
    assert mask_email("@example.com") == "***@example.com"


# --- 整形 -----------------------------------------------------------------


def test_json_formatter_emits_one_object_with_extras():
    line = JsonFormatter().format(_record(request_id="abc123", user_id="u1", status=200))
    payload = json.loads(line)

    assert payload["message"] == "hello"
    assert payload["level"] == "INFO"
    assert payload["request_id"] == "abc123"
    # extra= で渡した値がトップレベルのフィールドとして出る（検索できる形）
    assert payload["user_id"] == "u1"
    assert payload["status"] == 200
    # LogRecord の内部属性は漏らさない
    assert "args" not in payload
    assert "pathname" not in payload


def test_text_formatter_appends_extras():
    line = TextFormatter().format(_record(request_id="abc123", user_id="u1"))
    assert "hello" in line
    assert "[abc123]" in line
    assert "user_id=u1" in line


def test_formatters_drop_uvicorns_ansi_duplicate():
    # uvicorn は同じ本文を color_message として二重に載せてくる。
    # そのまま出すと制御文字がログに混ざるので落とす。
    record = _record(request_id="abc123", color_message="\x1b[32mhello\x1b[0m")

    assert "\x1b" not in TextFormatter().format(record)
    assert "color_message" not in json.loads(JsonFormatter().format(record))


# --- リクエストID ---------------------------------------------------------


def _app_with_middleware() -> FastAPI:
    app = FastAPI()
    app.add_middleware(RequestLoggingMiddleware)

    @app.get("/ping")
    def ping() -> dict[str, str]:
        return {"request_id": request_id_var.get()}

    @app.get("/boom")
    def boom() -> None:
        raise RuntimeError("something broke")

    return app


def test_request_id_is_generated_and_returned():
    client = TestClient(_app_with_middleware())
    res = client.get("/ping")

    assert res.status_code == 200
    assert res.headers["X-Request-ID"]
    # ハンドラ内から見える ID と、応答ヘッダの ID が一致する
    assert res.json()["request_id"] == res.headers["X-Request-ID"]


def test_incoming_request_id_is_reused():
    client = TestClient(_app_with_middleware())
    res = client.get("/ping", headers={"X-Request-ID": "trace-abc-123"})

    assert res.headers["X-Request-ID"] == "trace-abc-123"


def test_incoming_request_id_cannot_inject_log_lines():
    # 受け取った ID はそのままログ行に載るので、改行や空白は落とす
    client = TestClient(_app_with_middleware())
    res = client.get("/ping", headers={"X-Request-ID": "abc\ndef ghi"})

    assert res.headers["X-Request-ID"] == "abcdefghi"


def test_request_id_does_not_leak_between_requests():
    client = TestClient(_app_with_middleware())
    first = client.get("/ping").json()["request_id"]
    second = client.get("/ping").json()["request_id"]

    assert first != second
    # リクエスト外では既定値に戻っている
    assert request_id_var.get() == "-"


def test_unhandled_exception_is_logged_with_traceback(caplog):
    client = TestClient(_app_with_middleware(), raise_server_exceptions=False)
    with caplog.at_level(logging.ERROR, logger="app.request"):
        res = client.get("/boom")

    assert res.status_code == 500
    failures = [r for r in caplog.records if r.message == "request failed"]
    assert len(failures) == 1
    assert failures[0].exc_info is not None  # トレースが残る
    assert failures[0].path == "/boom"


# --- 秘密が漏れないこと ---------------------------------------------------


def test_rejected_token_is_never_written_to_the_log(caplog):
    secret = "this-value-must-never-appear-in-logs"
    with caplog.at_level(logging.DEBUG, logger="app.security"):
        assert decode_access_token(secret) is None

    assert any(r.message == "access token rejected" for r in caplog.records)
    assert secret not in caplog.text


def test_expired_token_logs_only_the_reason(caplog):
    # 署名は正しいが別の鍵で作った、といった失敗でも中身は出さない
    token = create_access_token("user-1")
    with caplog.at_level(logging.DEBUG, logger="app.security"):
        decode_access_token(token + "tampered")

    assert token not in caplog.text
    rejected = [r for r in caplog.records if r.message == "access token rejected"]
    assert rejected and hasattr(rejected[0], "reason")
