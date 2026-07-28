from fastapi import APIRouter

from app.schemas.fortune import FortuneRequest, FortuneResponse
from app.services.saju.pillars import calculate_four_pillars

router = APIRouter(tags=["fortune"])


@router.post("/fortune", response_model=FortuneResponse)
def create_fortune(req: FortuneRequest) -> FortuneResponse:
    """生年月日時から四柱推命の命式を算出する。"""
    return calculate_four_pillars(req)
