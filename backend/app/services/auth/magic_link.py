"""マジックリンク（パスワードレス登録/ログイン）のドメインロジック。"""

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    generate_magic_link_token,
    hash_token,
    magic_link_expiry,
)
from app.models.user import MagicLinkToken, User
from app.schemas.auth import AuthResult, UserOut
from app.services.email.base import EmailSender


async def request_magic_link(db: AsyncSession, email: str, sender: EmailSender) -> None:
    """メールアドレスに対して登録/ログイン用のマジックリンクを発行・送信する。

    未登録なら仮ユーザーを作成する。ユーザーの存在有無はレスポンスから
    判別できないようにする（アカウント列挙対策）。
    """
    email = email.strip().lower()

    user = await db.scalar(select(User).where(User.email == email))
    if user is None:
        user = User(email=email)
        db.add(user)
        await db.flush()

    raw_token, token_hash = generate_magic_link_token()
    db.add(
        MagicLinkToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=magic_link_expiry(),
        )
    )
    await db.commit()

    url = f"{settings.frontend_url}/auth/verify?token={raw_token}"
    await sender.send(
        to=email,
        subject="【四柱推命】登録用リンクのご案内",
        body=(
            "以下のリンクを開くと登録が完了し、ログインできます。\n"
            f"（有効期限: {settings.magic_link_expire_minutes}分）\n\n"
            f"{url}\n\n"
            "心当たりがない場合は、このメールを破棄してください。"
        ),
    )


async def verify_magic_link(db: AsyncSession, raw_token: str) -> AuthResult | None:
    """メールURLのトークンを検証し、成功ならログインセッションを返す。無効なら None。"""
    token_hash = hash_token(raw_token)
    token = await db.scalar(
        select(MagicLinkToken).where(MagicLinkToken.token_hash == token_hash)
    )

    now = datetime.now(timezone.utc)
    if token is None or token.used_at is not None or token.expires_at <= now:
        return None

    token.used_at = now
    user = await db.get(User, token.user_id)
    if user is None:
        return None
    user.is_verified = True
    await db.commit()

    return AuthResult(
        access_token=create_access_token(str(user.id)),
        user=UserOut(id=str(user.id), email=user.email, is_verified=user.is_verified),
    )
