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
        except Exception:
            # 未コミットの変更は with 抜けで破棄されるが、そのままだと
            # 「巻き戻した」事実がどこにも残らない。ロールバックだけ記録して送出は妨げない。
            logger.warning(
                "db session rolled back",
                extra={"error": "unhandled_exception"},
                exc_info=True,
            )
            raise
