"""チャット（マッチ内メッセージ）と既読管理のドメインロジック。"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.matching import Match, MatchRead, Message
from app.models.user import User
from app.schemas.matching import MessageOut


def to_message_out(msg: Message, me_id: uuid.UUID) -> MessageOut:
    return MessageOut(
        id=str(msg.id),
        match_id=str(msg.match_id),
        sender_id=str(msg.sender_id),
        body=msg.body,
        is_mine=msg.sender_id == me_id,
        created_at=msg.created_at,
    )


async def list_messages(
    db: AsyncSession, match: Match, me_id: uuid.UUID, limit: int = 200
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
    return [to_message_out(m, me_id) for m in reversed(msgs)]


async def create_message(
    db: AsyncSession, match: Match, sender_id: uuid.UUID, body: str
) -> Message:
    """メッセージを永続化して ORM オブジェクトを返す（WebSocket 配信で再利用）。"""
    msg = Message(match_id=match.id, sender_id=sender_id, body=body)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


async def send_message(
    db: AsyncSession, match: Match, sender_id: uuid.UUID, body: str
) -> MessageOut:
    msg = await create_message(db, match, sender_id, body)
    return to_message_out(msg, sender_id)


async def get_last_message(
    db: AsyncSession, match_id: uuid.UUID, me_id: uuid.UUID
) -> MessageOut | None:
    msg = await db.scalar(
        select(Message)
        .where(Message.match_id == match_id)
        .order_by(Message.created_at.desc())
        .limit(1)
    )
    return to_message_out(msg, me_id) if msg else None


# --- 既読・未読 ---


async def mark_read(db: AsyncSession, match_id: uuid.UUID, user_id: uuid.UUID) -> None:
    """このユーザーがマッチを今読んだ、として既読位置を更新する。"""
    rec = await db.scalar(
        select(MatchRead).where(
            MatchRead.match_id == match_id, MatchRead.user_id == user_id
        )
    )
    now = datetime.now(timezone.utc)
    if rec is None:
        db.add(MatchRead(match_id=match_id, user_id=user_id, last_read_at=now))
    else:
        rec.last_read_at = now
    await db.commit()


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
