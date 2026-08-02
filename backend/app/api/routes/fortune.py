from fastapi import APIRouter, HTTPException, status

from app.api.deps import RequestLang
from app.core.i18n import translate
from app.schemas.fortune import (
    DailyArea,
    DailyFortune,
    DailyFortuneRequest,
    DailyPoint,
    FortuneRequest,
    FortuneResponse,
    RadarAxis,
    SpeciesCompatMap,
)
from app.services import weather
from app.services.saju.analysis import element_ratios, ten_god_group_ratios
from app.services.saju.constants import FIVE_ELEMENTS
from app.services.saju.daily import (
    DAILY_AREAS,
    daily_areas,
    day_elements,
    element_moves,
    leading_driver,
    sky_of,
)
from app.services.saju.pillars import calculate_four_pillars, four_pillars
from app.services.saju.species import species
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


@router.post("/fortune/daily", response_model=DailyFortune)
def create_daily_fortune(req: DailyFortuneRequest, lang: RequestLang) -> DailyFortune:
    """その日の気象を五行に置き換え、命式と重ねて分野ごとの日運を出す。"""
    reading = weather.fetch(req.latitude, req.longitude)
    if reading is None:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE, translate("weather.unavailable", lang)
        )

    pillars, day_master = four_pillars(req)
    kind = species(pillars, day_master)
    chart = element_ratios(pillars)
    groups = ten_god_group_ratios(pillars)

    sky = sky_of(reading.weather_code)
    day = day_elements(reading.temperature_c, reading.humidity_pct, reading.daylight_hours, sky)
    scored = daily_areas(chart, groups, day, kind.element, is_male=req.is_male)

    # 星が同じなら位置（0〜100）で並べ替える
    ranked = sorted(scored, key=lambda area: (scored[area][0], scored[area][1]), reverse=True)
    fills, floods = element_moves(chart, day)

    def point(area: str) -> DailyPoint:
        kind_of, driver = leading_driver(
            day, chart, groups, kind.element, area, is_male=req.is_male
        )
        return DailyPoint(area=area, driver_kind=kind_of, driver=driver)

    return DailyFortune(
        reading=reading,
        sky=sky,
        elements=[RadarAxis(code=el, value=round(day[el] * 100, 1)) for el in FIVE_ELEMENTS],
        species=kind.code,
        areas=[
            DailyArea(code=area, stars=scored[area][0], score=scored[area][1])
            for area in DAILY_AREAS
        ],
        good=point(ranked[0]),
        bad=point(ranked[-1]),
        fills=fills,
        floods=floods,
    )
