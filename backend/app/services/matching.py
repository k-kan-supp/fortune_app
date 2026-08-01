"""マッチング（候補提示・いいね・成立判定）のドメインロジック。"""

import logging
import uuid
from datetime import date

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.matching import Block, Like, Match, Report
from app.models.profile import UserProfile
from app.models.user import User
from app.schemas.fortune import FortuneRequest
from app.schemas.matching import (
    CompatibilityChart,
    CompatibilityFacet,
    CompatibilityOut,
    LikeResult,
    MatchOut,
    PublicProfile,
)
from app.services.saju.compatibility import comparison_charts
from app.services.saju.compatibility import compatibility as saju_compatibility
from app.services.saju.pillars import four_pillars
from app.services.storage.base import FileStorage

logger = logging.getLogger("app.matching")

# 相性順に並べるとき、返す件数の何倍を母集団として取るか（と、その上限）。
# 広く取るほど順位は正確になるが、命式の計算がその分だけ増える。
CANDIDATE_POOL_FACTOR = 5
CANDIDATE_POOL_MAX = 200


async def is_blocked_between(db: AsyncSession, a: uuid.UUID, b: uuid.UUID) -> bool:
    """a と b の間にどちらか向きのブロックがあるか。"""
    found = await db.scalar(
        select(Block.id).where(
            or_(
                (Block.blocker_id == a) & (Block.blocked_id == b),
                (Block.blocker_id == b) & (Block.blocked_id == a),
            )
        )
    )
    return found is not None


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
    user: User,
    profile: UserProfile | None,
    storage: FileStorage,
    compatibility: float | None = None,
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
        compatibility=compatibility,
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
    i_blocked = select(Block.blocked_id).where(Block.blocker_id == me.id)
    blocked_me = select(Block.blocker_id).where(Block.blocked_id == me.id)
    stmt = (
        select(User, UserProfile)
        .join(UserProfile, UserProfile.user_id == User.id)
        .where(
            User.id != me.id,
            User.id.not_in(acted),
            User.id.not_in(i_blocked),
            User.id.not_in(blocked_me),
            # プロフィール（表示名）未設定のユーザーは候補に出さない
            UserProfile.display_name.isnot(None),
        )
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

    # 相性で並べ替えるため、返す件数より広めに取ってから絞る。
    # 先に SQL 側で limit すると「たまたま先頭に来た20人の中での順位」にしかならない。
    pool = min(limit * CANDIDATE_POOL_FACTOR, CANDIDATE_POOL_MAX)
    rows = (await db.execute(stmt.limit(pool))).all()

    my_profile = await db.scalar(select(UserProfile).where(UserProfile.user_id == me.id))
    mine = _fortune_request(my_profile)
    my_pillars = four_pillars(mine)[0] if mine else None

    scored: list[tuple[float | None, User, UserProfile]] = []
    for user, profile in rows:
        score: float | None = None
        if my_pillars is not None:
            theirs = _fortune_request(profile)
            if theirs is not None:
                score = saju_compatibility(my_pillars, four_pillars(theirs)[0])[0]
        scored.append((score, user, profile))

    # 相性が高い順。生年月日が未登録で相性を出せない候補は末尾へ。
    scored.sort(key=lambda row: (row[0] is None, -(row[0] or 0.0)))
    return [
        to_public_profile(user, profile, storage, score)
        for score, user, profile in scored[:limit]
    ]


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
    if is_like and not await is_blocked_between(db, me.id, target_uuid):
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
                logger.info(
                    "match created",
                    extra={
                        "match_id": str(matched.id),
                        "user_id": str(me.id),
                        "peer_id": str(target_uuid),
                    },
                )

    await db.commit()

    # マッチ成立は上で別に記録済み。ここは全操作の履歴として残す。
    logger.info(
        "like recorded",
        extra={
            "user_id": str(me.id),
            "peer_id": str(target_uuid),
            "is_like": is_like,
            "changed": existing is not None,
            "matched": matched is not None,
        },
    )
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
        if await is_blocked_between(db, me.id, other_id):
            continue  # ブロック中の相手とのマッチは一覧から除外
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
    """自分が参加しているマッチのみ取得する（他人・ブロック中の相手は None）。"""
    try:
        mid = uuid.UUID(match_id)
    except ValueError:
        return None
    match = await db.scalar(
        select(Match).where(
            Match.id == mid,
            or_(Match.user_a_id == me.id, Match.user_b_id == me.id),
        )
    )
    if match is None:
        return None
    other_id = match.user_b_id if match.user_a_id == me.id else match.user_a_id
    if await is_blocked_between(db, me.id, other_id):
        return None  # ブロック関係があればチャット不可
    return match


async def block_user(db: AsyncSession, me: User, target_id: uuid.UUID) -> None:
    """target をブロックする（冪等）。"""
    if target_id == me.id:
        return
    existing = await db.scalar(
        select(Block).where(Block.blocker_id == me.id, Block.blocked_id == target_id)
    )
    if existing is None:
        db.add(Block(blocker_id=me.id, blocked_id=target_id))
        await db.commit()
        logger.info(
            "user blocked",
            extra={"user_id": str(me.id), "peer_id": str(target_id)},
        )


async def unblock_user(db: AsyncSession, me: User, target_id: uuid.UUID) -> None:
    existing = await db.scalar(
        select(Block).where(Block.blocker_id == me.id, Block.blocked_id == target_id)
    )
    if existing is not None:
        await db.delete(existing)
        await db.commit()
        # ブロックと対で残さないと、解除済みかどうかを後から追えない。
        logger.info(
            "user unblocked",
            extra={"user_id": str(me.id), "peer_id": str(target_id)},
        )


async def list_blocked(
    db: AsyncSession, me: User, storage: FileStorage
) -> list[PublicProfile]:
    """自分がブロックしているユーザーの一覧。"""
    rows = (
        await db.execute(
            select(User, UserProfile)
            .join(Block, Block.blocked_id == User.id)
            .outerjoin(UserProfile, UserProfile.user_id == User.id)
            .where(Block.blocker_id == me.id)
            .order_by(Block.created_at.desc())
        )
    ).all()
    return [to_public_profile(user, profile, storage) for user, profile in rows]


async def report_user(
    db: AsyncSession, me: User, target_id: uuid.UUID, reason: str
) -> None:
    db.add(Report(reporter_id=me.id, reported_id=target_id, reason=reason))
    await db.commit()
    # 通報は必ず人が見る。本文は DB にあるので、ログには誰から誰へかだけ残す。
    logger.warning(
        "user reported",
        extra={"user_id": str(me.id), "peer_id": str(target_id)},
    )


def match_peer_id(match: Match, me_id: uuid.UUID) -> uuid.UUID:
    """マッチの相手側ユーザーIDを返す。"""
    return match.user_b_id if match.user_a_id == me_id else match.user_a_id


def _fortune_request(profile: UserProfile | None) -> FortuneRequest | None:
    """プロフィールの生年月日時から鑑定リクエストを組み立てる。未登録なら None。"""
    if profile is None or profile.birthday is None:
        return None

    born = profile.birthday
    time = profile.birth_time
    return FortuneRequest(
        year=born.year,
        month=born.month,
        day=born.day,
        # 出生時刻が未登録なら、入力フォームと同じ既定（12時）で見る
        hour=time.hour if time else 12,
        minute=time.minute if time else 0,
        is_male=profile.gender != "female",
    )


async def compatibility_with(
    db: AsyncSession, me: User, target_id: uuid.UUID
) -> CompatibilityOut | None:
    """自分と相手の命式から相性を出す。どちらかの生年月日が未登録なら None。"""
    profiles = {
        p.user_id: p
        for p in (
            await db.scalars(
                select(UserProfile).where(UserProfile.user_id.in_([me.id, target_id]))
            )
        ).all()
    }

    mine = _fortune_request(profiles.get(me.id))
    theirs = _fortune_request(profiles.get(target_id))
    if mine is None or theirs is None:
        # 「相性が出ない」の問い合わせは、どちら側の生年月日が欠けているかで対応が変わる。
        logger.info(
            "compatibility skipped",
            extra={
                "user_id": str(me.id),
                "peer_id": str(target_id),
                "reason": "birthday_missing",
                "missing": ",".join(
                    side
                    for side, req in (("me", mine), ("peer", theirs))
                    if req is None
                ),
            },
        )
        return None

    my_pillars, _ = four_pillars(mine)
    their_pillars, _ = four_pillars(theirs)

    score, facets, notes = saju_compatibility(my_pillars, their_pillars)
    return CompatibilityOut(
        score=score,
        facets=[CompatibilityFacet(code=code, value=value) for code, value in facets.items()],
        notes=notes,
        charts=[
            CompatibilityChart(
                key=chart.key,
                axes=chart.axes,
                you=chart.you,
                them=chart.them,
                max_value=chart.max_value,
                highlight=chart.highlight,
            )
            for chart in comparison_charts(my_pillars, their_pillars)
        ],
    )
