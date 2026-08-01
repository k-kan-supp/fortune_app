import uuid
from datetime import date, datetime, time
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, Time, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:  # 実行時は SQLAlchemy が registry から解決するため import 不要
    from app.models.user import User


class UserProfile(Base):
    """ユーザーのプロフィール（User と 1:1）。

    認証(User)とは関心を分け、表示名・生年月日時・アイコンをここに持つ。
    """

    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )

    display_name: Mapped[str | None] = mapped_column(String(50), nullable=True)
    birthday: Mapped[date | None] = mapped_column(Date, nullable=True)
    birth_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)  # male/female/other

    # マッチング向けの一般的なプロフィール項目
    height_cm: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight_kg: Mapped[int | None] = mapped_column(Integer, nullable=True)
    body_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    blood_type: Mapped[str | None] = mapped_column(String(2), nullable=True)  # A/B/O/AB
    occupation: Mapped[str | None] = mapped_column(String(50), nullable=True)
    education: Mapped[str | None] = mapped_column(String(20), nullable=True)
    prefecture: Mapped[str | None] = mapped_column(String(20), nullable=True)  # 居住地
    marital_status: Mapped[str | None] = mapped_column(String(20), nullable=True)
    smoking: Mapped[str | None] = mapped_column(String(20), nullable=True)
    drinking: Mapped[str | None] = mapped_column(String(20), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)  # 自己紹介

    # ストレージ上のキー（例: "avatars/xxx.webp"）。公開URLは設定から組み立てる。
    avatar_key: Mapped[str | None] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="profile")
