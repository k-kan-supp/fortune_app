"""アプリ全体のログ設定。

開発では読みやすい1行テキスト、本番では JSON で出す（収集基盤に載せるため）。
リクエストIDを ContextVar で持ち回るので、1リクエスト分のログを後から辿れる。

このアプリは生年月日・チャット本文・メールアドレスを扱う。**ログに素の個人情報や
トークンを載せない**こと。メールは :func:`mask_email` を通し、マジックリンクの
トークンと JWT は理由だけを残して値そのものは決して記録しない。
"""

import json
import logging
import sys
from contextvars import ContextVar
from typing import Any

from app.core.config import settings

# 未設定のまま出たログ（起動時など）は "-" になる
request_id_var: ContextVar[str] = ContextVar("request_id", default="-")

# LogRecord が標準で持つ属性。これ以外を「呼び出し側が extra= で足した情報」とみなす。
_STANDARD_FIELDS = frozenset(
    {
        "args", "asctime", "created", "exc_info", "exc_text", "filename",
        "funcName", "levelname", "levelno", "lineno", "message", "module",
        "msecs", "msg", "name", "pathname", "process", "processName",
        "relativeCreated", "request_id", "stack_info", "taskName", "thread",
        "threadName",
        # uvicorn が独自に載せる ANSI 装飾つきの複製。そのまま出すと制御文字が混ざる。
        "color_message",
    }
)


def mask_email(email: str) -> str:
    """ログ用にメールアドレスを伏せる（``ren@example.com`` → ``r***@example.com``）。

    問い合わせ対応で「どのドメインの人か」までは追える一方、
    アドレスそのものはログから復元できない粒度に落とす。
    """
    local, sep, domain = email.partition("@")
    if not sep or not domain:
        return "***"
    return f"{local[:1]}***@{domain}" if local else f"***@{domain}"


def _extras(record: logging.LogRecord) -> dict[str, Any]:
    return {k: v for k, v in record.__dict__.items() if k not in _STANDARD_FIELDS}


class JsonFormatter(logging.Formatter):
    """1行1JSON。収集基盤でそのままフィールド検索できる形にする。"""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": getattr(record, "request_id", "-"),
            **_extras(record),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False, default=str)


class TextFormatter(logging.Formatter):
    """開発用。extra= で足した情報を ``key=value`` で末尾に並べる。"""

    def __init__(self) -> None:
        super().__init__(
            fmt="%(asctime)s %(levelname)-7s [%(request_id)s] %(name)s: %(message)s",
            datefmt="%H:%M:%S",
        )

    def format(self, record: logging.LogRecord) -> str:
        line = super().format(record)
        extras = _extras(record)
        if extras:
            line += " " + " ".join(f"{k}={v}" for k, v in extras.items())
        return line


class _RequestIdFilter(logging.Filter):
    """どのロガーから出たログにも、いまのリクエストIDを付ける。"""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get()
        return True


# 未捕捉例外は RequestLoggingMiddleware が request_id・path・所要時間つきで
# 記録済み。Starlette がさらに uvicorn まで送出するため、そのままだと同じ
# トレースが2回出て 1件の 500 が200行になる。uvicorn 側だけ落とす。
_UVICORN_DUPLICATE = "Exception in ASGI application"


class _DropDuplicateAsgiError(logging.Filter):
    """uvicorn が出す重複トレースだけを捨てる。

    ロガーではなくハンドラに付ける。uvicorn は起動時に dictConfig を適用して
    自分のロガーの filters を空にするため、ロガー側に付けても消される。
    """

    def filter(self, record: logging.LogRecord) -> bool:
        # uvicorn は末尾に改行を付けて出すので、完全一致では外れる
        return not (
            record.name == "uvicorn.error"
            and record.getMessage().strip() == _UVICORN_DUPLICATE
        )


def configure_logging() -> None:
    """ルートロガーを差し替える。アプリ起動時に一度だけ呼ぶ。"""
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(_RequestIdFilter())
    handler.addFilter(_DropDuplicateAsgiError())
    handler.setFormatter(JsonFormatter() if settings.log_json else TextFormatter())

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(settings.log_level.upper())

    # uvicorn は自前のハンドラを持つので、外して同じ出力へ流し込む。
    # そうしないとリクエストIDの付かないログが混ざる。
    for name in ("uvicorn", "uvicorn.error"):
        uv = logging.getLogger(name)
        uv.handlers = []
        uv.propagate = True

    # アクセスログは RequestLoggingMiddleware が
    # リクエストID・所要時間つきで出すので、uvicorn 側は黙らせる。
    # 残すと1リクエストにつき2行になり、しかも片方には ID が付かない。
    access = logging.getLogger("uvicorn.access")
    access.handlers = []
    access.propagate = False
