"""トークン発行・ハッシュ・JWT を扱う共通処理。"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import settings

_ALGORITHM = "HS256"


def generate_magic_link_token() -> tuple[str, str]:
    """(生トークン, ハッシュ) を返す。生トークンはメールURLへ、ハッシュはDBへ保存する。"""
    raw = secrets.token_urlsafe(32)
    return raw, hash_token(raw)


def hash_token(raw: str) -> str:
    """URL 由来の生トークンを検索・保存用に SHA-256 でハッシュ化する。"""
    return hashlib.sha256(raw.encode()).hexdigest()


def magic_link_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(minutes=settings.magic_link_expire_minutes)


def create_access_token(subject: str) -> str:
    """ログインセッション用の JWT を発行する（subject = user id）。"""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=_ALGORITHM)


def decode_access_token(token: str) -> str | None:
    """JWT を検証し、有効なら subject(user id) を返す。無効なら None。"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[_ALGORITHM])
    except jwt.PyJWTError:
        return None
    return payload.get("sub")
