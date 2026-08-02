from fastapi import APIRouter

from app.schemas.fortune import FortuneRequest, FortuneResponse, SpeciesCompatMap
from app.services.saju.pillars import calculate_four_pillars
from app.services.saju.species_compat import (
    CODES,
    ELEMENT_RELATIONS,
    ROW_MEANS,
    bands,
    mean,
    scaled_matrix,
)

router = APIRouter(tags=["fortune"])


@router.post("/fortune", response_model=FortuneResponse)
def create_fortune(req: FortuneRequest) -> FortuneResponse:
    """生年月日時から四柱推命の命式を算出する。"""
    return calculate_four_pillars(req)


@router.get("/species/compatibility", response_model=SpeciesCompatMap)
def species_compatibility() -> SpeciesCompatMap:
    """25 種族どうしの相性マップ。誰が呼んでも同じ内容が返る。"""
    low, high = bands()
    return SpeciesCompatMap(
        codes=list(CODES),
        matrix=scaled_matrix(),
        row_means=list(ROW_MEANS),
        element_relations=dict(ELEMENT_RELATIONS),
        band_low=low,
        band_high=high,
        mean=mean(),
    )
