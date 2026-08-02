from fastapi import APIRouter, HTTPException, status

from app.api.deps import RequestLang
from app.core.i18n import translate
from app.schemas.fortune import (
    DailyFortune,
    DailyFortuneRequest,
    FortuneRequest,
    FortuneResponse,
    RadarAxis,
    SpeciesCompatMap,
)
from app.services import weather
from app.services.saju.analysis import element_ratios
from app.services.saju.constants import FIVE_ELEMENTS
from app.services.saju.daily import daily_score, day_elements, element_moves, sky_of
from app.services.saju.pillars import calculate_four_pillars, four_pillars
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


# 日運の帯。0〜100 を三等分する。
_DAILY_BANDS = (34.0, 67.0)


@router.post("/fortune/daily", response_model=DailyFortune)
def create_daily_fortune(req: DailyFortuneRequest, lang: RequestLang) -> DailyFortune:
    """その日の気象を五行に置き換え、命式と重ねて日運を出す。"""
    reading = weather.fetch(req.latitude, req.longitude)
    if reading is None:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, translate("weather.unavailable", lang)
        )

    pillars, _ = four_pillars(req)
    chart = element_ratios(pillars)
    sky = sky_of(reading.weather_code)
    day = day_elements(
        reading.temperature_c, reading.humidity_pct, reading.daylight_hours, sky
    )
    score = daily_score(chart, day)
    fills, floods = element_moves(chart, day)

    low, high = _DAILY_BANDS
    return DailyFortune(
        reading=reading,
        sky=sky,
        elements=[RadarAxis(code=el, value=round(day[el] * 100, 1)) for el in FIVE_ELEMENTS],
        score=score,
        band="high" if score >= high else "low" if score <= low else "mid",
        fills=fills,
        floods=floods,
    )
