from fastapi import APIRouter, HTTPException, status

from app.schemas.analytics import AnalyticsAccepted, AnalyticsBatch
from app.services.analytics.events import (
    CLIENT_EVENTS,
    emit,
    personal_keys,
    requires_consent,
)

router = APIRouter(tags=["analytics"])


@router.post(
    "/analytics/events",
    response_model=AnalyticsAccepted,
    status_code=status.HTTP_202_ACCEPTED,
)
def collect_events(batch: AnalyticsBatch) -> AnalyticsAccepted:
    """画面からの計測イベントを受け取る。

    未登録の名前と個人特定プロパティは 422 で落とす。握り潰すと、壊れた計測を
    抱えたまま数字だけが出てしまう ── 気づけないのが最悪なので、ここは黙らせない。
    detail は開発者向けで画面には出ないため、翻訳しない。
    """
    accepted = 0
    dropped = 0

    for event in batch.events:
        if event.name not in CLIENT_EVENTS:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                f"unregistered event: {event.name}",
            )
        leaked = personal_keys(event.props)
        if leaked:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_CONTENT,
                f"personal property not allowed: {', '.join(leaked)}",
            )
        if not batch.consent and requires_consent(event.name):
            dropped += 1
            continue
        emit(event.name, event.props, source="client", acquired_from=batch.source)
        accepted += 1

    return AnalyticsAccepted(accepted=accepted, dropped=dropped)
