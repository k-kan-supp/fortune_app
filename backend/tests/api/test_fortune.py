import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

client = TestClient(app)


def _rate_limit_middleware():
    """組み立て済みのミドルウェア実体を取り出す（差し替えて上限を下げるため）。"""
    from app.core.ratelimit import RateLimitMiddleware

    stack = app.middleware_stack
    while stack is not None:
        if isinstance(stack, RateLimitMiddleware):
            return stack
        stack = getattr(stack, "app", None)
    raise AssertionError("RateLimitMiddleware が組み込まれていない")


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


@pytest.mark.skipif(
    __import__("importlib.util", fromlist=["find_spec"]).find_spec("sxtwl") is None,
    reason="sxtwl 未インストール",
)
def test_create_fortune():
    res = client.post(
        "/api/fortune",
        json={"year": 1990, "month": 5, "day": 15, "hour": 10, "is_male": True},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["day_master"] in list("甲乙丙丁戊己庚辛壬癸")
    assert body["day_pillar"]["ten_god"] == "比肩"  # 日主自身は比肩

    # レーダーチャート10種が、軸の値が外周を超えない形で返る
    charts = body["charts"]
    assert len(charts) == 10
    for chart in charts:
        assert chart["axes"], chart["key"]
        assert all(0 <= a["value"] <= chart["max_value"] for a in chart["axes"]), chart["key"]


@pytest.mark.skipif(
    __import__("importlib.util", fromlist=["find_spec"]).find_spec("sxtwl") is None,
    reason="sxtwl 未インストール",
)
def test_paid_notes_do_not_leak_when_the_paywall_is_on(monkeypatch):
    """未開放のレスポンスに有料の本文が1文字も含まれないこと。

    ここが漏れると課金設計そのものが無意味になるので、キーの有無ではなく
    「本文が空であること」と「命式側は無傷であること」を両方見る。
    """
    monkeypatch.setattr(settings, "paywall_enabled", True)
    # 予告の幅は M29 の検証で見る。ここは「漏れないこと」だけを見たいので閉じ切る。
    monkeypatch.setattr(settings, "paywall_preview_sentences", 0)
    res = client.post(
        "/api/fortune",
        json={"year": 1990, "month": 5, "day": 15, "hour": 10, "is_male": True},
    )
    assert res.status_code == 200
    body = res.json()

    for chart in body["charts"]:
        if chart["note_tier"] == "paid":
            assert chart["note_locked"] is True, chart["key"]
            assert chart["strength_note"] == [], chart["key"]
            assert chart["weakness_note"] == [], chart["key"]
            # 何が隠れているかは見せる。隠すと課金動機が生まれない。
            assert "strengths" in chart
        else:
            assert chart["note_locked"] is False, chart["key"]

    # 命式そのものは無料のまま出し切る
    assert body["day_pillar"]["ten_god"] == "比肩"
    assert body["day_pillar"]["hidden_stems"]
    assert all(chart["axes"] for chart in body["charts"])


@pytest.mark.skipif(
    __import__("importlib.util", fromlist=["find_spec"]).find_spec("sxtwl") is None,
    reason="sxtwl 未インストール",
)
def test_notes_are_open_while_there_is_nothing_to_buy():
    """決済が無い間は開けておく。買えない有料区画を作らない。"""
    res = client.post(
        "/api/fortune",
        json={"year": 1990, "month": 5, "day": 15, "hour": 10, "is_male": True},
    )
    charts = res.json()["charts"]
    assert all(not chart["note_locked"] for chart in charts)
    assert any(chart["strength_note"] or chart["weakness_note"] for chart in charts)


def test_public_endpoint_is_rate_limited(monkeypatch):
    """認証なしで叩けるぶん、上限が無いと外から叩き放題になる。"""
    from app.core.ratelimit import RateLimiter

    limiter = RateLimiter(limit=2, window_seconds=60)
    monkeypatch.setattr(_rate_limit_middleware(), "limiter", limiter)

    payload = {"year": 1990, "month": 5, "day": 15, "hour": 10, "is_male": True}
    codes = [client.post("/api/fortune", json=payload).status_code for _ in range(3)]
    assert codes[-1] == 429

    blocked = client.post("/api/fortune", json=payload)
    assert blocked.headers["Retry-After"]
    assert blocked.json()["detail"]


def test_rate_limit_leaves_authenticated_routes_alone():
    """守りたいのは公開の計算だけ。認証済みの操作まで巻き込まない。"""
    from app.core.ratelimit import RateLimitMiddleware
    from app.main import app as fastapi_app

    limited = next(
        m for m in fastapi_app.user_middleware if m.cls is RateLimitMiddleware
    )
    prefixes = limited.kwargs["prefixes"]
    assert not any(p.startswith("/api/matching") or p.startswith("/api/profile") for p in prefixes)


@pytest.mark.skipif(
    __import__("importlib.util", fromlist=["find_spec"]).find_spec("sxtwl") is None,
    reason="sxtwl 未インストール",
)
def test_preview_shows_the_opening_and_counts_the_rest(monkeypatch):
    """壁は「続きがある」と分かる形で立てる。無言で終わらせない。"""
    monkeypatch.setattr(settings, "paywall_enabled", True)
    monkeypatch.setattr(settings, "paywall_preview_sentences", 2)
    res = client.post(
        "/api/fortune",
        json={"year": 1990, "month": 5, "day": 15, "hour": 10, "is_male": True},
    )
    locked = [c for c in res.json()["charts"] if c["note_locked"] and c["note_hidden"]]
    assert locked, "有料側が1枚も無いと、この検証が空回りする"
    for chart in locked:
        assert len(chart["strength_note"]) <= 2, chart["key"]
        # 予告に核心の一文を混ぜない
        shown = [s["key"] for s in chart["strength_note"] + chart["weakness_note"]]
        assert not any(key.startswith("hint.") for key in shown), chart["key"]
        assert chart["note_hidden"] > 0


@pytest.mark.skipif(
    __import__("importlib.util", fromlist=["find_spec"]).find_spec("sxtwl") is None,
    reason="sxtwl 未インストール",
)
def test_preview_width_moves_by_configuration(monkeypatch):
    """壁の位置はデプロイなしで動かせること。検証のたびに出荷しない。"""
    payload = {"year": 1990, "month": 5, "day": 15, "hour": 10, "is_male": True}
    monkeypatch.setattr(settings, "paywall_enabled", True)

    monkeypatch.setattr(settings, "paywall_preview_sentences", 0)
    none_shown = client.post("/api/fortune", json=payload).json()["charts"]
    monkeypatch.setattr(settings, "paywall_preview_sentences", 2)
    some_shown = client.post("/api/fortune", json=payload).json()["charts"]

    def sentences(charts):
        return sum(len(c["strength_note"]) for c in charts if c["note_locked"])

    assert sentences(none_shown) == 0
    assert sentences(some_shown) > 0
