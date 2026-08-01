"""チャット（マッチ内メッセージ）と既読管理のドメインロジック。

**本文は絶対にログに残さない**。誰がどのマッチに何文字送ったかまでで、
中身は DB を見るしかない粒度に留める。
"""

import logging
import uuid
from datetime import UTC, datetime

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.matching import Match, MatchRead, Message
from app.models.user import User
from app.schemas.matching import MessageOut
from app.services.images import to_bounded_webp
from app.services.storage.base import FileStorage

logger = logging.getLogger("app.chat")

_CHAT_IMAGE_MAX_PX = 1280


def to_message_out(
    msg: Message,
    me_id: uuid.UUID,
    storage: FileStorage,
    peer_read_at: datetime | None = None,
) -> MessageOut:
    # 自分の送信で、相手の既読位置がその時刻以降なら「既読」
    read = bool(
        msg.sender_id == me_id
        and peer_read_at is not None
        and msg.created_at <= peer_read_at
    )
    return MessageOut(
        id=str(msg.id),
        match_id=str(msg.match_id),
        sender_id=str(msg.sender_id),
        body=msg.body,
        image_url=storage.url(msg.image_key) if msg.image_key else None,
        is_mine=msg.sender_id == me_id,
        read=read,
        created_at=msg.created_at,
    )


async def peer_last_read_at(
    db: AsyncSession, match: Match, me_id: uuid.UUID
) -> datetime | None:
    """相手（マッチのもう一方）の既読時刻を返す。"""
    peer_id = match.user_b_id if match.user_a_id == me_id else match.user_a_id
    rec = await db.scalar(
        select(MatchRead).where(
            MatchRead.match_id == match.id, MatchRead.user_id == peer_id
        )
    )
    return rec.last_read_at if rec else None


async def list_messages(
    db: AsyncSession, match: Match, me_id: uuid.UUID, storage: FileStorage, limit: int = 200
) -> list[MessageOut]:
    """マッチのメッセージを古い順に返す（直近 ``limit`` 件）。"""
    msgs = (
        await db.scalars(
            select(Message)
            .where(Message.match_id == match.id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
    ).all()
    peer_read = await peer_last_read_at(db, match, me_id)
    return [to_message_out(m, me_id, storage, peer_read) for m in reversed(msgs)]


async def create_message(
    db: AsyncSession,
    match: Match,
    sender_id: uuid.UUID,
    body: str = "",
    image_key: str | None = None,
) -> Message:
    """メッセージを永続化して ORM オブジェクトを返す（WebSocket 配信で再利用）。"""
    msg = Message(match_id=match.id, sender_id=sender_id, body=body, image_key=image_key)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    # 本文の代わりに文字数だけ残す。空文字＋画像だけの送信も区別できる。
    logger.info(
        "message sent",
        extra={
            "match_id": str(match.id),
            "user_id": str(sender_id),
            "body_len": len(body),
            "has_image": image_key is not None,
        },
    )
    return msg


async def send_message(
    db: AsyncSession, match: Match, sender_id: uuid.UUID, body: str, storage: FileStorage
) -> MessageOut:
    msg = await create_message(db, match, sender_id, body=body)
    return to_message_out(msg, sender_id, storage)


def process_chat_image(raw: bytes) -> bytes:
    """チャット画像を検証し、長辺を上限に縮小して WebP バイト列で返す。"""
    processed = to_bounded_webp(raw, _CHAT_IMAGE_MAX_PX)
    logger.debug(
        "chat image processed",
        extra={"in_bytes": len(raw), "out_bytes": len(processed)},
    )
    return processed


async def get_last_message(
    db: AsyncSession, match_id: uuid.UUID, me_id: uuid.UUID, storage: FileStorage
) -> MessageOut | None:
    msg = await db.scalar(
        select(Message)
        .where(Message.match_id == match_id)
        .order_by(Message.created_at.desc())
        .limit(1)
    )
    return to_message_out(msg, me_id, storage) if msg else None


# --- 既読・未読 ---


async def mark_read(
    db: AsyncSession, match_id: uuid.UUID, user_id: uuid.UUID
) -> datetime:
    """このユーザーがマッチを今読んだ、として既読位置を更新し、その時刻を返す。"""
    rec = await db.scalar(
        select(MatchRead).where(
            MatchRead.match_id == match_id, MatchRead.user_id == user_id
        )
    )
    now = datetime.now(UTC)
    if rec is None:
        db.add(MatchRead(match_id=match_id, user_id=user_id, last_read_at=now))
    else:
        rec.last_read_at = now
    await db.commit()

    # 既読はポーリングのたびに動くので debug。既読が進まない不具合の調査用。
    logger.debug(
        "match read",
        extra={"match_id": str(match_id), "user_id": str(user_id)},
    )
    return now


async def unread_count(
    db: AsyncSession, match_id: uuid.UUID, user_id: uuid.UUID
) -> int:
    """相手からの未読メッセージ数（既読位置より後・自分以外が送信）。"""
    rec = await db.scalar(
        select(MatchRead).where(
            MatchRead.match_id == match_id, MatchRead.user_id == user_id
        )
    )
    stmt = (
        select(func.count())
        .select_from(Message)
        .where(Message.match_id == match_id, Message.sender_id != user_id)
    )
    if rec is not None:
        stmt = stmt.where(Message.created_at > rec.last_read_at)
    return await db.scalar(stmt) or 0


async def total_unread(db: AsyncSession, me: User) -> int:
    """自分が参加する全マッチの未読合計（ナビのバッジ用）。"""
    match_ids = (
        await db.scalars(
            select(Match.id).where(
                or_(Match.user_a_id == me.id, Match.user_b_id == me.id)
            )
        )
    ).all()
    total = 0
    for mid in match_ids:
        total += await unread_count(db, mid, me.id)
    return total
