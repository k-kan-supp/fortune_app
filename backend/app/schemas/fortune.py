from pydantic import BaseModel, Field


class FortuneRequest(BaseModel):
    """鑑定リクエスト（入力の契約）。"""

    year: int = Field(..., ge=1900, le=2100, description="西暦の生まれ年")
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    hour: int = Field(12, ge=0, le=23, description="生まれた時刻（時）")
    minute: int = Field(0, ge=0, le=59)
    is_male: bool = Field(True, description="性別（大運の順逆に使用）")


class Pillar(BaseModel):
    """一柱（天干＋地支）。"""

    stem: str = Field(..., description="天干（十干）")
    branch: str = Field(..., description="地支（十二支）")
    element: str = Field(..., description="天干の五行")
    ten_god: str | None = Field(None, description="日主から見た十神")
    hidden_stems: list[str] = Field(default_factory=list, description="蔵干")


class FortuneResponse(BaseModel):
    """鑑定結果（命式）。"""

    year_pillar: Pillar
    month_pillar: Pillar
    day_pillar: Pillar
    hour_pillar: Pillar
    day_master: str = Field(..., description="日主（日柱の天干）")
