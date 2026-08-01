"""FastAPI 依存性（DB セッション・認証済みユーザー取得・表示言語）。"""

import logging
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.i18n import Lang, resolve_lang, translate
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

logger = logging.getLogger("app.auth")

DbSession = Annotated[AsyncSession, Depends(get_db)]

_bearer = HTTPBearer(auto_error=True)


def get_lang(accept_language: Annotated[str | None, Header()] = None) -> Lang:
    """`Accept-Language` ヘッダからレスポンス文言の言語を決める。"""
    return resolve_lang(accept_language)


RequestLang = Annotated[Lang, Depends(get_lang)]


async def get_current_user(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
    lang: RequestLang,
) -> User:
    """Authorization: Bearer <JWT> から現在のユーザーを取得する。"""
    # トークン自体が壊れている場合は decode_access_token が理由つきで記録済み。
    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, translate("auth.token_invalid", lang)
        )

    user = await db.get(User, user_id)
    if user is None:
        # 署名は通ったのに実体が無い＝退会済みか、鍵を共有する別環境のトークン。
        # 通常は起きないので warning で拾う。
        logger.warning(
            "token points at a missing user", extra={"user_id": str(user_id)}
        )
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, translate("auth.user_not_found", lang)
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
