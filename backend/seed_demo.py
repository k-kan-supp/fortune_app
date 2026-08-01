"""デモ用ユーザー・プロフィール・マッチ・メッセージを投入する。

コンテナ内で実行する（DB ホスト名 `db` を解決するため）:

    docker compose exec backend python seed_demo.py

冪等: 既に存在するデータは作り直さない。ログインは各メール宛のマジックリンクで。
主役は hina@example.com（他5名が既にいいね済み → 誰かをいいねすれば即マッチ、
ren とは成立済みで未読メッセージあり）。
"""

import asyncio
import io
import uuid
from datetime import UTC, date, datetime, timedelta

from PIL import Image
from sqlalchemy import select

from app.db.session import SessionLocal, engine
from app.models.matching import Like, Match, Message
from app.models.profile import UserProfile
from app.models.user import User
from app.services.storage import get_file_storage

DEMO = [
    dict(email="hina@example.com", name="ひな", gender="female", birthday=date(1996, 8, 20),
         prefecture="東京都", occupation="デザイナー", height=160, body_type="slim",
         bio="週末はカフェ巡りと写真が好きです。よろしくお願いします！", color=(216, 167, 196)),
    dict(email="ren@example.com", name="れん", gender="male", birthday=date(1993, 3, 5),
         prefecture="東京都", occupation="エンジニア", height=176, body_type="average",
         bio="映画とコーヒーが好き。落ち着いた時間を一緒に過ごせたら。", color=(231, 184, 154)),
    dict(email="yuto@example.com", name="ゆうと", gender="male", birthday=date(1990, 11, 12),
         prefecture="神奈川県", occupation="営業", height=182, body_type="muscular",
         bio="週末はランニングとサウナ。美味しいごはんを食べに行きましょう。",
         color=(169, 198, 176)),
    dict(email="mio@example.com", name="みお", gender="female", birthday=date(1998, 1, 28),
         prefecture="埼玉県", occupation="看護師", height=158, body_type="average",
         bio="音楽フェスと旅行が好きです。おすすめのお店教えてください！", color=(150, 190, 210)),
    dict(email="yui@example.com", name="ゆい", gender="female", birthday=date(1995, 6, 3),
         prefecture="千葉県", occupation="保育士", height=162, body_type="slim",
         bio="のんびり過ごすのが好き。動物と甘いものに弱いです🐈", color=(214, 180, 140)),
    dict(email="sora@example.com", name="そら", gender="other", birthday=date(1994, 9, 17),
         prefecture="東京都", occupation="フォトグラファー", height=170, body_type="slim",
         bio="街歩きしながら写真を撮っています。展示によく行きます。", color=(190, 170, 210)),
]


async def ensure_user(db, d, storage) -> User:
    user = await db.scalar(select(User).where(User.email == d["email"]))
    if user is None:
        user = User(email=d["email"], is_verified=True)
        db.add(user)
        await db.flush()

    prof = await db.scalar(select(UserProfile).where(UserProfile.user_id == user.id))
    if prof is None:
        # 単色のアバターを生成して保存（プレースホルダより見栄えが良い）
        key = f"avatars/{uuid.uuid4().hex}.webp"
        buf = io.BytesIO()
        Image.new("RGB", (512, 512), d["color"]).save(buf, format="WEBP")
        await storage.save(key, buf.getvalue())
        db.add(
            UserProfile(
                user_id=user.id, display_name=d["name"], gender=d["gender"],
                birthday=d["birthday"], prefecture=d["prefecture"],
                occupation=d["occupation"], height_cm=d["height"],
                body_type=d["body_type"], bio=d["bio"], avatar_key=key,
            )
        )
    return user


async def ensure_like(db, frm: uuid.UUID, to: uuid.UUID) -> None:
    exists = await db.scalar(
        select(Like).where(Like.from_user_id == frm, Like.to_user_id == to)
    )
    if exists is None:
        db.add(Like(from_user_id=frm, to_user_id=to, is_like=True))


def ordered(a: uuid.UUID, b: uuid.UUID) -> tuple[uuid.UUID, uuid.UUID]:
    return (a, b) if a.int < b.int else (b, a)


async def main() -> None:
    storage = get_file_storage()
    async with SessionLocal() as db:
        users = {d["email"]: await ensure_user(db, d, storage) for d in DEMO}
        await db.commit()

        hina = users["hina@example.com"]
        ren = users["ren@example.com"]

        # 全員が hina をいいね済み → hina が誰かをいいねすれば即マッチ
        for u in users.values():
            if u.id != hina.id:
                await ensure_like(db, u.id, hina.id)
        # hina ↔ ren は相互いいね（成立済みマッチにする）
        await ensure_like(db, hina.id, ren.id)
        await db.commit()

        # 成立済みマッチ + チャット履歴（最後は ren 発 → hina 側は未読）
        a, b = ordered(hina.id, ren.id)
        match = await db.scalar(
            select(Match).where(Match.user_a_id == a, Match.user_b_id == b)
        )
        if match is None:
            match = Match(user_a_id=a, user_b_id=b)
            db.add(match)
            await db.flush()

        has_msg = await db.scalar(select(Message).where(Message.match_id == match.id))
        if has_msg is None:
            now = datetime.now(UTC)
            convo = [
                (ren.id, "はじめまして！プロフィール拝見しました😊", 5),
                (hina.id, "はじめまして、メッセージありがとうございます！", 4),
                (ren.id, "週末とかお時間あるときにお茶でもいかがですか？", 2),
            ]
            for sender, text, mins_ago in convo:
                db.add(
                    Message(
                        match_id=match.id, sender_id=sender, body=text,
                        created_at=now - timedelta(minutes=mins_ago),
                    )
                )
        await db.commit()

    await engine.dispose()
    print(f"✓ シード完了: {len(DEMO)}名のデモユーザー")
    print("  ログイン例: hina@example.com（マジックリンクは backend ログに出ます）")
    print("  - ren とは成立済み（未読あり） / 他4名は hina をいいね済み")


if __name__ == "__main__":
    asyncio.run(main())
