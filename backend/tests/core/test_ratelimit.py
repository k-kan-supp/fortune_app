"""公開エンドポイントのレート制限。

命式を認証なしで見せる（登録前に価値を渡す）代わりに要る守り。
守りが強すぎて通常利用を壊していないことも、ここで一緒に見る。
"""

from starlette.requests import Request

from app.core.ratelimit import _SWEEP_EVERY, RateLimiter, client_key, parse_networks


def test_allows_up_to_the_limit():
    limiter = RateLimiter(limit=3, window_seconds=60)
    assert [limiter.check("a", now=0.0) for _ in range(3)] == [None, None, None]


def test_blocks_past_the_limit():
    limiter = RateLimiter(limit=3, window_seconds=60)
    for _ in range(3):
        limiter.check("a", now=0.0)
    retry_after = limiter.check("a", now=0.0)
    assert retry_after == 60


def test_recovers_once_the_window_passes():
    """窓を出た分は数えない。恒久 BAN にしない。"""
    limiter = RateLimiter(limit=2, window_seconds=10)
    limiter.check("a", now=0.0)
    limiter.check("a", now=1.0)
    assert limiter.check("a", now=5.0) is not None
    assert limiter.check("a", now=11.0) is None


def test_counts_each_client_separately():
    """1人の連打で他の全員を巻き込まない。"""
    limiter = RateLimiter(limit=1, window_seconds=60)
    assert limiter.check("a", now=0.0) is None
    assert limiter.check("b", now=0.0) is None
    assert limiter.check("a", now=0.0) is not None


def test_forgets_clients_that_stopped_coming():
    """使われていない IP を捨てないと、際限なく溜まる。"""
    limiter = RateLimiter(limit=10_000, window_seconds=1)
    for i in range(600):
        limiter.check(f"ip-{i}", now=0.0)
    assert len(limiter._hits) == 600

    # 掃除は一定回数ごと。窓を大きく越えた時刻で通り続ければ、古い IP は落ちる
    for _ in range(_SWEEP_EVERY):
        limiter.check("steady", now=100.0)
    assert list(limiter._hits) == ["steady"]


def _request(peer: str, forwarded: str | None = None) -> Request:
    """接続元と X-Forwarded-For だけを持つ最小のリクエスト。"""
    headers = [(b"x-forwarded-for", forwarded.encode())] if forwarded else []
    return Request({"type": "http", "headers": headers, "client": (peer, 1234)})


TRUSTED = parse_networks("172.16.0.0/12")


def test_counts_the_proxy_itself_when_nothing_is_trusted():
    """信頼するプロキシを設定していなければ、接続元をそのまま数える。"""
    assert client_key(_request("172.21.0.4", "203.0.113.9"), parse_networks("")) == "172.21.0.4"


def test_counts_the_real_client_behind_a_trusted_proxy():
    """ここを取り違えると、利用者全員が1つの枠を共有して一斉に 429 になる。"""
    assert client_key(_request("172.21.0.4", "203.0.113.9"), TRUSTED) == "203.0.113.9"


def test_ignores_a_forwarded_header_from_an_untrusted_peer():
    """誰でも書けるヘッダを信じると、毎回違う値を送るだけで上限を素通りできる。"""
    assert client_key(_request("203.0.113.9", "10.0.0.1"), TRUSTED) == "203.0.113.9"


def test_walks_past_chained_proxies():
    """多段プロキシでは、前段でない最初の値＝実際の利用者を採る。"""
    forwarded = "203.0.113.9, 172.21.0.7, 172.21.0.4"
    assert client_key(_request("172.21.0.4", forwarded), TRUSTED) == "203.0.113.9"


def test_falls_back_when_the_header_holds_only_proxies():
    assert client_key(_request("172.21.0.4", "172.21.0.7"), TRUSTED) == "172.21.0.4"


def test_missing_header_behind_a_proxy_falls_back_to_the_peer():
    assert client_key(_request("172.21.0.4"), TRUSTED) == "172.21.0.4"


def test_garbage_in_the_configuration_is_dropped():
    assert parse_networks("172.16.0.0/12, not-an-ip, ") == parse_networks("172.16.0.0/12")


def test_separate_clients_behind_one_proxy_get_separate_budgets():
    """同じプロキシ配下でも、利用者ごとに枠が分かれること。"""
    limiter = RateLimiter(limit=1, window_seconds=60)
    a = client_key(_request("172.21.0.4", "203.0.113.1"), TRUSTED)
    b = client_key(_request("172.21.0.4", "203.0.113.2"), TRUSTED)
    assert limiter.check(a, now=0.0) is None
    assert limiter.check(b, now=0.0) is None
    assert limiter.check(a, now=0.0) is not None
