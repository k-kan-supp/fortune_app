"""プロフィール取得・更新・アイコン処理のドメインロジック。"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.profile import UserProfile
from app.models.user import User
from app.schemas.profile import ProfileOut, ProfileUpdate
from app.services.images import InvalidImageError, to_square_webp
from app.services.storage.base import FileStorage


async def get_or_create_profile(db: AsyncSession, user: User) -> UserProfile:
    profile = await db.scalar(select(UserProfile).where(UserProfile.user_id == user.id))
    if profile is None:
        profile = UserProfile(user_id=user.id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
    return profile


def to_out(user: User, profile: UserProfile, storage: FileStorage) -> ProfileOut:
    # 編集可能フィールドはモデルからそのまま写す（フィールド追加時もここは不変）
    editable = {name: getattr(profile, name) for name in ProfileUpdate.model_fields}
    return ProfileOut(
        **editable,
        email=user.email,
        avatar_url=storage.url(profile.avatar_key) if profile.avatar_key else None,
    )


async def update_profile(
    db: AsyncSession, profile: UserProfile, data: ProfileUpdate
) -> UserProfile:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile)
    return profile


async def set_avatar(
    db: AsyncSession, profile: UserProfile, raw: bytes, storage: FileStorage
) -> UserProfile:
    """アイコン画像を処理・保存し、プロフィールに紐づける。"""
    if len(raw) > settings.avatar_max_bytes:
        raise InvalidImageError("image.too_large")

    processed = to_square_webp(raw, settings.avatar_size_px)
    new_key = f"avatars/{uuid.uuid4().hex}.webp"
    await storage.save(new_key, processed)

    old_key = profile.avatar_key
    profile.avatar_key = new_key
    await db.commit()
    await db.refresh(profile)

    if old_key:  # 差し替え後に古いファイルを掃除
        await storage.delete(old_key)
    return profile


async def remove_avatar(
    db: AsyncSession, profile: UserProfile, storage: FileStorage
) -> UserProfile:
    if profile.avatar_key:
        await storage.delete(profile.avatar_key)
        profile.avatar_key = None
        await db.commit()
        await db.refresh(profile)
    return profile
