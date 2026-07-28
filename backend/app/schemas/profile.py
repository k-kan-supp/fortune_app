from datetime import date, time
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

Gender = Literal["male", "female", "other"]
BodyType = Literal["slim", "average", "muscular", "plump"]
BloodType = Literal["A", "B", "O", "AB"]
Education = Literal["high_school", "vocational", "junior_college", "university", "graduate"]
MaritalStatus = Literal["single", "married", "divorced"]
SmokingStatus = Literal["no", "yes", "sometimes", "quit"]
DrinkingStatus = Literal["no", "yes", "sometimes"]


class ProfileUpdate(BaseModel):
    """プロフィール更新リクエスト（アイコンを除く編集可能フィールド）。"""

    # 基本情報
    display_name: str | None = Field(None, max_length=50)
    birthday: date | None = None
    birth_time: time | None = None
    gender: Gender | None = None

    # 身体・マッチング項目
    height_cm: int | None = Field(None, ge=100, le=250)
    weight_kg: int | None = Field(None, ge=30, le=200)
    body_type: BodyType | None = None
    blood_type: BloodType | None = None
    occupation: str | None = Field(None, max_length=50)
    education: Education | None = None
    prefecture: str | None = Field(None, max_length=20)
    marital_status: MaritalStatus | None = None
    smoking: SmokingStatus | None = None
    drinking: DrinkingStatus | None = None
    bio: str | None = Field(None, max_length=1000)


class ProfileOut(ProfileUpdate):
    """プロフィール表示用レスポンス（編集フィールド + 読み取り専用項目）。"""

    email: EmailStr
    avatar_url: str | None = None
