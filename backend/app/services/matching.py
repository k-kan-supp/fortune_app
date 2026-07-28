"""マッチング（候補提示・いいね・成立判定）のドメインロジック。"""

import uuid
from datetime import date

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.matching import Like, Match
from app.models.profile import UserProfile
from app.models.user import User
from app.schemas.matching import LikeResult, MatchOut, PublicProfile
from app.services.storage.base import FileStorage


def _age(birthday: date | None) -> int | None:
    if birthday is None:
        return None
    today = date.today()
    return today.year - birthday.year - (
        (today.month, today.day) < (birthday.month, birthday.day)
    )


def _years_ago(years: int) -> date:
    """今日から ``years`` 年前の日付（2/29 は 2/28 に丸める）。"""
    today = date.today()
    try:
        return today.replace(year=today.year - years)
    except ValueError:
        return today.replace(year=today.year - years, day=28)


def to_public_profile(
    user: User, profile: UserProfile | None, storage: FileStorage
) -> PublicProfile:
    p = profile
    return PublicProfile(
        user_id=str(user.id),
        display_name=p.display_name if p else None,
        age=_age(p.birthday) if p else None,
        gender=p.gender if p else None,
        prefecture=p.prefecture if p else None,
        occupation=p.occupation if p else None,
        height_cm=p.height_cm if p else None,
        body_type=p.body_type if p else None,
        bio=p.bio if p else None,
        avatar_url=storage.url(p.avatar_key) if p and p.avatar_key else None,
    )


def _ordered_pair(a: uuid.UUID, b: uuid.UUID) -> tuple[uuid.UUID, uuid.UUID]:
    """Match 保存用に (小, 大) の順に並べる（ペアの一意性を保つため）。"""
    return (a, b) if a.int < b.int else (b, a)


async def list_candidates(
    db: AsyncSession,
    me: User,
    storage: FileStorage,
    *,
    gender: str | None = None,
    min_age: int | None = None,
    max_age: int | None = None,
    prefecture: str | None = None,
    limit: int = 20,
) -> list[PublicProfile]:
    """まだ操作していない他ユーザーを候補として返す（任意の条件で絞り込み）。"""
    acted = select(Like.to_user_id).where(Like.from_user_id == me.id)
    stmt = (
        select(User, UserProfile)
        .outerjoin(UserProfile, UserProfile.user_id == User.id)
        .where(User.id != me.id, User.id.not_in(acted))
    )

    if gender:
        stmt = stmt.where(UserProfile.gender == gender)
    if prefecture:
        stmt = stmt.where(UserProfile.prefecture == prefecture)
    # 年齢は誕生日の範囲に変換して絞り込む
    if min_age is not None:
        stmt = stmt.where(UserProfile.birthday <= _years_ago(min_age))
    if max_age is not None:
        stmt = stmt.where(UserProfile.birthday > _years_ago(max_age + 1))

    rows = (await db.execute(stmt.limit(limit))).all()
    return [to_public_profile(user, profile, storage) for user, profile in rows]


async def like_user(
    db: AsyncSession, me: User, target_id: str, is_like: bool
) -> LikeResult:
    """いいね/スキップを記録し、相互いいねならマッチを成立させる。"""
    target_uuid = uuid.UUID(target_id)

    existing = await db.scalar(
        select(Like).where(Like.from_user_id == me.id, Like.to_user_id == target_uuid)
    )
    if existing is None:
        db.add(Like(from_user_id=me.id, to_user_id=target_uuid, is_like=is_like))
    else:
        existing.is_like = is_like

    matched: Match | None = None
    if is_like:
        # 相手が既に自分をいいねしているか
        reciprocal = await db.scalar(
            select(Like).where(
                Like.from_user_id == target_uuid,
                Like.to_user_id == me.id,
                Like.is_like.is_(True),
            )
        )
        if reciprocal is not None:
            a, b = _ordered_pair(me.id, target_uuid)
            matched = await db.scalar(
                select(Match).where(Match.user_a_id == a, Match.user_b_id == b)
            )
            if matched is None:
                matched = Match(user_a_id=a, user_b_id=b)
                db.add(matched)
                await db.flush()

    await db.commit()
    return LikeResult(
        matched=matched is not None,
        match_id=str(matched.id) if matched else None,
    )


async def list_matches(db: AsyncSession, me: User, storage: FileStorage) -> list[MatchOut]:
    """自分が関わる成立済みマッチを、相手プロフィール付きで返す。"""
    from app.services.chat import get_last_message, unread_count  # 遅延importで循環回避

    matches = (
        await db.scalars(
            select(Match)
            .where(or_(Match.user_a_id == me.id, Match.user_b_id == me.id))
            .order_by(Match.created_at.desc())
        )
    ).all()

    result: list[MatchOut] = []
    for m in matches:
        other_id = m.user_b_id if m.user_a_id == me.id else m.user_a_id
        row = (
            await db.execute(
                select(User, UserProfile)
                .outerjoin(UserProfile, UserProfile.user_id == User.id)
                .where(User.id == other_id)
            )
        ).first()
        if row is None:
            continue
        user, profile = row
        result.append(
            MatchOut(
                match_id=str(m.id),
                user=to_public_profile(user, profile, storage),
                last_message=await get_last_message(db, m.id, me.id, storage),
                unread_count=await unread_count(db, m.id, me.id),
                created_at=m.created_at,
            )
        )
    return result


async def get_match_or_none(db: AsyncSession, me: User, match_id: str) -> Match | None:
    """自分が参加しているマッチのみ取得する（他人のマッチは None）。"""
    try:
        mid = uuid.UUID(match_id)
    except ValueError:
        return None
    return await db.scalar(
        select(Match).where(
            Match.id == mid,
            or_(Match.user_a_id == me.id, Match.user_b_id == me.id),
        )
    )
