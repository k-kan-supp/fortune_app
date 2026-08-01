"""リクエスト単位のログ。

1リクエストにつき1行、結果と所要時間を残す。未捕捉の例外はここで必ず記録してから
送出するので、500 が出たのに手掛かりが無い、という状態にはならない。
"""

import logging
import re
import time
import uuid
from collections.abc import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import request_id_var

logger = logging.getLogger("app.request")

# ヘルスチェックは常時叩かれるので、通常のログには出さない
_QUIET_PATHS = frozenset({"/health"})

# 受け取ったIDはそのままログに出るため、改行などを混ぜられないよう文字種を絞る
_ID_SAFE = re.compile(r"[^A-Za-z0-9._-]")


def _incoming_id(raw: str | None) -> str:
    """呼び出し元が付けた ID を引き継ぐ。無ければ新規発行する。"""
    if not raw:
        return uuid.uuid4().hex[:12]
    return _ID_SAFE.sub("", raw)[:64] or uuid.uuid4().hex[:12]


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        request_id = _incoming_id(request.headers.get("x-request-id"))
        token = request_id_var.set(request_id)
        started = time.perf_counter()

        # クエリ文字列はマジックリンクのトークンを含むので、パスだけを残す
        path = request.url.path
        # else 節で記録する。finally より先に走るので、リセット前の ID が載る。
        try:
            response = await call_next(request)
        except Exception:
            logger.exception(
                "request failed",
                extra={
                    "method": request.method,
                    "path": path,
                    "duration_ms": round((time.perf_counter() - started) * 1000, 1),
                },
            )
            raise
        else:
            logger.log(
                logging.DEBUG if path in _QUIET_PATHS else logging.INFO,
                "request",
                extra={
                    "method": request.method,
                    "path": path,
                    "status": response.status_code,
                    "duration_ms": round((time.perf_counter() - started) * 1000, 1),
                },
            )
            response.headers["X-Request-ID"] = request_id
            return response
        finally:
            request_id_var.reset(token)
