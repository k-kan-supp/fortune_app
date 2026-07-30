from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbSession, RequestLang
from app.core.i18n import translate
from app.schemas.auth import (
    AuthResult,
    MagicLinkRequest,
    MagicLinkVerifyRequest,
    MessageResponse,
    UserOut,
)
from app.services.auth.magic_link import request_magic_link, verify_magic_link
from app.services.email import get_email_sender

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/magic-link", response_model=MessageResponse)
async def send_magic_link(
    req: MagicLinkRequest, db: DbSession, lang: RequestLang
) -> MessageResponse:
    """メールアドレスを受け取り、登録用URLを送信する。

    アカウント列挙を防ぐため、登録有無に関わらず同じレスポンスを返す。
    メール本文もリクエストの言語に合わせる。
    """
    await request_magic_link(db, req.email, get_email_sender(), lang)
    return MessageResponse(message=translate("auth.magic_link_sent", lang))


@router.post("/verify", response_model=AuthResult)
async def verify(
    req: MagicLinkVerifyRequest, db: DbSession, lang: RequestLang
) -> AuthResult:
    """メールURL内のトークンを検証し、ログインセッションを発行する。"""
    result = await verify_magic_link(db, req.token)
    if result is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            translate("auth.link_invalid", lang),
        )
    return result


@router.get("/me", response_model=UserOut)
async def me(user: CurrentUser) -> UserOut:
    """現在ログイン中のユーザー情報を返す。"""
    return UserOut(id=str(user.id), email=user.email, is_verified=user.is_verified)
