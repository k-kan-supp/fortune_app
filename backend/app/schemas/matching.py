from datetime import datetime

from pydantic import BaseModel, Field


class PublicProfile(BaseModel):
    """他ユーザーに見せる公開プロフィール（メール等の非公開情報は含めない）。"""

    user_id: str
    display_name: str | None
    age: int | None
    gender: str | None
    prefecture: str | None
    occupation: str | None
    height_cm: int | None
    body_type: str | None
    bio: str | None
    avatar_url: str | None


class CompatibilityFacet(BaseModel):
    """相性の内訳ひとつ（day_master / branch / element）。"""

    code: str = Field(..., description="内訳の種別。表示名はフロントで解決する")
    value: float = Field(..., description="0〜100 の点数")


class CompatibilityOut(BaseModel):
    """二人の命式から見た相性。"""

    score: float = Field(..., description="総合点（0〜100）")
    facets: list[CompatibilityFacet]
    notes: list[str] = Field(
        default_factory=list, description="説明文のキー（day_master.generates など）"
    )


class LikeRequest(BaseModel):
    target_user_id: str
    like: bool = True  # True=いいね / False=スキップ


class LikeResult(BaseModel):
    matched: bool
    match_id: str | None = None


class MessageOut(BaseModel):
    id: str
    match_id: str
    sender_id: str
    body: str
    image_url: str | None = None
    is_mine: bool
    read: bool = False
    created_at: datetime


class MessageIn(BaseModel):
    body: str = Field(..., min_length=1, max_length=2000)


class MatchOut(BaseModel):
    match_id: str
    user: PublicProfile
    last_message: MessageOut | None = None
    unread_count: int = 0
    created_at: datetime


class UnreadCount(BaseModel):
    count: int


class ReportRequest(BaseModel):
    reason: str = Field("", max_length=1000)
