"""公開エンドポイントのレート制限。

命式を認証なしで見せる（登録前に価値を渡す）代わりに要る守り。
守りが強すぎて通常利用を壊していないことも、ここで一緒に見る。
"""

from app.core.ratelimit import _SWEEP_EVERY, RateLimiter


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
