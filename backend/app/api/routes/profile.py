from fastapi import APIRouter, HTTPException, UploadFile, status

from app.api.deps import CurrentUser, DbSession, RequestLang
from app.core.i18n import translate
from app.schemas.profile import ProfileOut, ProfileUpdate
from app.services.images import ALLOWED_IMAGE_TYPES
from app.services.profile import (
    get_or_create_profile,
    remove_avatar,
    set_avatar,
    to_out,
    update_profile,
)
from app.services.storage import get_file_storage

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=ProfileOut)
async def read_profile(user: CurrentUser, db: DbSession) -> ProfileOut:
    profile = await get_or_create_profile(db, user)
    return to_out(user, profile, get_file_storage())


@router.put("/me", response_model=ProfileOut)
async def edit_profile(data: ProfileUpdate, user: CurrentUser, db: DbSession) -> ProfileOut:
    profile = await get_or_create_profile(db, user)
    profile = await update_profile(db, profile, data)
    return to_out(user, profile, get_file_storage())


@router.put("/me/avatar", response_model=ProfileOut)
async def upload_avatar(
    file: UploadFile, user: CurrentUser, db: DbSession, lang: RequestLang
) -> ProfileOut:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            translate("image.unsupported_type", lang),
        )
    storage = get_file_storage()
    profile = await get_or_create_profile(db, user)
    # 画像として読めない・大きすぎる場合は InvalidImageError が飛び、
    # main.py の例外ハンドラが言語に応じた 400 に変換する
    profile = await set_avatar(db, profile, await file.read(), storage)
    return to_out(user, profile, storage)


@router.delete("/me/avatar", response_model=ProfileOut)
async def delete_avatar(user: CurrentUser, db: DbSession) -> ProfileOut:
    storage = get_file_storage()
    profile = await get_or_create_profile(db, user)
    profile = await remove_avatar(db, profile, storage)
    return to_out(user, profile, storage)
