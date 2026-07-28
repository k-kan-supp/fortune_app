import uuid

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, DbSession
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.matching import (
    LikeRequest,
    LikeResult,
    MatchOut,
    MessageIn,
    MessageOut,
    PublicProfile,
    UnreadCount,
)
from app.services.chat import (
    InvalidImageError,
    create_message,
    list_messages,
    mark_read,
    process_chat_image,
    send_message,
    total_unread,
)
from app.services.matching import (
    get_match_or_none,
    like_user,
    list_candidates,
    list_matches,
)
from app.services.realtime import manager
from app.services.storage import get_file_storage

router = APIRouter(prefix="/matching", tags=["matching"])


@router.get("/candidates", response_model=list[PublicProfile])
async def candidates(
    user: CurrentUser,
    db: DbSession,
    gender: str | None = None,
    min_age: int | None = None,
    max_age: int | None = None,
    prefecture: str | None = None,
) -> list[PublicProfile]:
    """まだ操作していない他ユーザーの候補一覧（条件で絞り込み可）。"""
    return await list_candidates(
        db,
        user,
        get_file_storage(),
        gender=gender,
        min_age=min_age,
        max_age=max_age,
        prefecture=prefecture,
    )


@router.post("/likes", response_model=LikeResult)
async def like(req: LikeRequest, user: CurrentUser, db: DbSession) -> LikeResult:
    """いいね/スキップを送る。相互いいねならマッチ成立。"""
    if req.target_user_id == str(user.id):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "自分自身は対象にできません。")
    return await like_user(db, user, req.target_user_id, req.like)


@router.get("/matches", response_model=list[MatchOut])
async def matches(user: CurrentUser, db: DbSession) -> list[MatchOut]:
    """成立済みマッチ一覧（相手プロフィール・最新メッセージ・未読数付き）。"""
    return await list_matches(db, user, get_file_storage())


@router.get("/unread-count", response_model=UnreadCount)
async def unread(user: CurrentUser, db: DbSession) -> UnreadCount:
    """全マッチ合計の未読件数（ナビのバッジ用）。"""
    return UnreadCount(count=await total_unread(db, user))


async def _require_match(db: DbSession, user: CurrentUser, match_id: str):
    match = await get_match_or_none(db, user, match_id)
    if match is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "マッチが見つかりません。")
    return match


@router.get("/matches/{match_id}/messages", response_model=list[MessageOut])
async def get_messages(match_id: str, user: CurrentUser, db: DbSession) -> list[MessageOut]:
    """マッチ内のメッセージを取得する。取得時に既読化する。"""
    match = await _require_match(db, user, match_id)
    msgs = await list_messages(db, match, user.id, get_file_storage())
    await mark_read(db, match.id, user.id)
    return msgs


@router.post("/matches/{match_id}/messages", response_model=MessageOut)
async def post_message(
    match_id: str, req: MessageIn, user: CurrentUser, db: DbSession
) -> MessageOut:
    """マッチ内にテキストメッセージを送信する（REST フォールバック）。"""
    match = await _require_match(db, user, match_id)
    return await send_message(db, match, user.id, req.body, get_file_storage())


_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/matches/{match_id}/images", response_model=MessageOut)
async def post_image(
    match_id: str, file: UploadFile, user: CurrentUser, db: DbSession
) -> MessageOut:
    """マッチ内に画像メッセージを送信する。保存後 WebSocket でも配信する。"""
    if file.content_type not in _ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            "対応していない画像形式です（JPEG / PNG / WebP / GIF）。",
        )
    match = await _require_match(db, user, match_id)
    storage = get_file_storage()
    try:
        processed = process_chat_image(await file.read())
    except InvalidImageError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e)) from e

    key = f"chat/{uuid.uuid4().hex}.webp"
    await storage.save(key, processed)
    msg = await create_message(db, match, user.id, image_key=key)
    await manager.broadcast(match.id, msg, storage)
    from app.services.chat import to_message_out

    return to_message_out(msg, user.id, storage)


@router.post("/matches/{match_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def read_match(match_id: str, user: CurrentUser, db: DbSession) -> None:
    """マッチを既読にする。"""
    match = await _require_match(db, user, match_id)
    await mark_read(db, match.id, user.id)


@router.websocket("/matches/{match_id}/ws")
async def chat_ws(
    websocket: WebSocket,
    match_id: str,
    token: str = "",
    db: AsyncSession = Depends(get_db),
) -> None:
    """マッチ内チャットのリアルタイム接続。

    ブラウザは WS ヘッダを付けにくいため、認証トークンはクエリで受け取る。
    受信した本文を永続化し、同じマッチの全接続へ配信する。
    """
    user_id = decode_access_token(token)
    if user_id is None:
        await websocket.close(code=4401)
        return
    user = await db.get(User, user_id)
    if user is None:
        await websocket.close(code=4401)
        return
    match = await get_match_or_none(db, user, match_id)
    if match is None:
        await websocket.close(code=4404)
        return

    match_uuid: uuid.UUID = match.id
    storage = get_file_storage()
    await manager.connect(match_uuid, websocket, user.id)
    await mark_read(db, match_uuid, user.id)
    try:
        while True:
            data = await websocket.receive_json()
            if not isinstance(data, dict):
                continue

            if data.get("type") == "typing":
                await manager.notify_typing(
                    match_uuid, user.id, bool(data.get("is_typing"))
                )
                continue

            # 既定はメッセージ送信（type 省略も許容）
            body = (data.get("body") or "").strip()
            if not body:
                continue
            msg = await create_message(db, match, user.id, body=body)
            await manager.broadcast(match_uuid, msg, storage)
    except WebSocketDisconnect:
        manager.disconnect(match_uuid, websocket)
