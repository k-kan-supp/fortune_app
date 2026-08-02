from pydantic import BaseModel, Field

from app.services.analytics.events import PropValue


class AnalyticsEvent(BaseModel):
    name: str = Field(max_length=64)
    props: dict[str, PropValue] = Field(default_factory=dict)


class AnalyticsBatch(BaseModel):
    """画面からまとめて届く計測イベント。

    ``consent`` はその時点でユーザーが同意しているかどうか。同意していなければ
    サーバ側で落とす ── 画面側の判断だけに任せない。
    """

    events: list[AnalyticsEvent] = Field(min_length=1, max_length=50)
    consent: bool = False


class AnalyticsAccepted(BaseModel):
    accepted: int
    dropped: int
