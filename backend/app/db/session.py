import logging
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

logger = logging.getLogger("app.db")

engine = create_async_engine(settings.database_url, echo=settings.app_env == "development")

SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """リクエストごとの DB セッションを提供する FastAPI 依存性。"""
    async with SessionLocal() as session:
        try:
            yield session
        except Exception as e:
            # 未コミットの変更は with 抜けで破棄されるが、そのままだと
            # 「巻き戻した」事実がどこにも残らない。ロールバックだけ記録して送出は妨げない。
            #
            # トレースはここでは出さない。同じ例外を RequestLoggingMiddleware が
            # 同じ request_id で記録するので、exc_info を付けると 1件のエラーに
            # 対してトレースが2本並ぶ。種別だけ残せば突き合わせはできる。
            logger.warning(
                "db session rolled back",
                extra={"reason": type(e).__name__},
            )
            raise
