"""公開エンドポイントのレート制限。

命式の計算は認証なしで引ける（結果を見せてから登録を求めるため）。そのぶん
外から叩き放題になるので、IP 単位で上限を設ける。

制限値は実利用を妨げない水準にする。ここを絞りすぎると、守るために本来の導線
── 検索から来た人がその場で何度か条件を変えて試す ── を壊すことになる。

保持はプロセス内のみ。多重起動すると上限がプロセス数だけ緩むが、共有ストアを
持ち込む前に、まず単純な連打を止める。ここが不足になったら Redis に移す。
"""

import logging
import time
from collections import defaultdict, deque
from collections.abc import Awaitable, Callable
from typing import Final

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.i18n import resolve_lang, translate

logger = logging.getLogger("app.ratelimit")

# 使われていない IP を捨てる間隔。放っておくと際限なく溜まる。
_SWEEP_EVERY: Final = 500


class RateLimiter:
    """IP ごとのスライディングウィンドウ。"""

    def __init__(self, *, limit: int, window_seconds: float) -> None:
        self.limit = limit
        self.window = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._since_sweep = 0

    def _sweep(self, now: float) -> None:
        """窓から出きった IP を捨てる。"""
        stale = [ip for ip, hits in self._hits.items() if not hits or now - hits[-1] > self.window]
        for ip in stale:
            del self._hits[ip]

    def check(self, key: str, *, now: float | None = None) -> float | None:
        """超過していなければ None、していれば次に空くまでの秒数を返す。"""
        now = time.monotonic() if now is None else now

        self._since_sweep += 1
        if self._since_sweep >= _SWEEP_EVERY:
            self._since_sweep = 0
            self._sweep(now)

        hits = self._hits[key]
        cutoff = now - self.window
        while hits and hits[0] <= cutoff:
            hits.popleft()

        if len(hits) >= self.limit:
            return max(0.0, hits[0] + self.window - now)

        hits.append(now)
        return None


class RateLimitMiddleware(BaseHTTPMiddleware):
    """指定したパス配下だけを制限する。

    対象を絞るのは、認証済みの操作まで巻き込むと通常利用が壊れるため。
    守りたいのは「誰でも叩ける計算エンドポイント」だけ。
    """

    def __init__(
        self,
        app: Callable[..., Awaitable[None]],
        *,
        prefixes: tuple[str, ...],
        limit: int,
        window_seconds: float,
    ) -> None:
        super().__init__(app)
        self.prefixes = prefixes
        self.limiter = RateLimiter(limit=limit, window_seconds=window_seconds)

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        path = request.url.path
        if not path.startswith(self.prefixes):
            return await call_next(request)

        # プロキシ配下では X-Forwarded-For が要るが、偽装できるので採用しない。
        # 前段を置くときは、そちら側で制限をかけるか信頼できる値に絞ってから使う。
        client = request.client.host if request.client else "unknown"

        retry_after = self.limiter.check(client)
        if retry_after is None:
            return await call_next(request)

        logger.info("rate limited", extra={"path": path, "retry_after": round(retry_after, 1)})
        lang = resolve_lang(request.headers.get("accept-language"))
        return JSONResponse(
            status_code=429,
            content={"detail": translate("rate.limited", lang)},
            headers={"Retry-After": str(max(1, int(retry_after) + 1))},
        )
