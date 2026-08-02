"""日運（その日の気象から出す運勢）。

外部通信はテストしない。気象の観測値を渡したときの振る舞いだけを見る。
"""

import pytest

from app.services.saju.analysis import element_ratios, ten_god_group_ratios
from app.services.saju.constants import FIVE_ELEMENTS, TEN_GOD_GROUPS
from app.services.saju.daily import (
    DAILY_AREAS,
    DAYLIGHT_RANGE,
    MAX_STARS,
    REACHABLE_DAYS,
    SKY_CODES,
    TEMP_RANGE,
    air_groups,
    area_scores,
    daily_areas,
    day_elements,
    leading_driver,
    sky_of,
)
from tests.services.test_analysis import PILLARS

CHART = element_ratios(PILLARS)  # 金に寄り、水がほとんど無い命式
GROUPS = ten_god_group_ratios(PILLARS)  # 比劫に寄った命式

# 真夏の晴れ / 真冬の雪 / 梅雨の雨
HOT_CLEAR = (33.0, 45.0, 14.2, "clear")
COLD_SNOW = (-1.0, 70.0, 9.7, "snow")
WET_RAIN = (22.0, 92.0, 13.5, "rain")


def test_sky_codes_cover_the_wmo_set_without_overlap():
    seen: set[int] = set()
    for codes in SKY_CODES.values():
        assert not seen & set(codes)
        seen |= set(codes)
    assert sky_of(0) == "clear"
    assert sky_of(71) == "snow"
    assert sky_of(95) == "storm"
    assert sky_of(4242) == "cloudy"  # 未知のコードは曇り扱い


@pytest.mark.parametrize("reading", [HOT_CLEAR, COLD_SNOW, WET_RAIN])
def test_day_elements_are_a_ratio_over_the_five(reading):
    day = day_elements(*reading)
    assert set(day) == set(FIVE_ELEMENTS)
    assert all(v >= 0 for v in day.values())
    assert sum(day.values()) == pytest.approx(1.0)


def test_heat_and_sun_raise_fire_while_cold_snow_raises_water():
    summer = day_elements(*HOT_CLEAR)
    winter = day_elements(*COLD_SNOW)
    assert summer["火"] > winter["火"]
    assert winter["水"] > summer["水"]


def test_damp_rain_raises_water_over_metal():
    wet = day_elements(*WET_RAIN)
    assert wet["水"] > wet["金"]


def test_health_is_higher_when_the_air_supplies_what_the_chart_lacks():
    """この命式は水が薄い。水を足す日のほうが、乾いた日より健康運が高く出る。"""
    rainy = area_scores(CHART, GROUPS, day_elements(*WET_RAIN), "金", is_male=True)
    dry = area_scores(CHART, GROUPS, day_elements(20.0, 25.0, 12.0, "clear"), "金", is_male=True)
    assert rainy["health"] > dry["health"]


def test_real_midsummer_reading_is_not_pinned_to_the_ends():
    """実測が基準の外に出ると星が端に張り付く。基準は入力空間の全域を覆うこと。

    2026-08-02 の東京（31.5℃ / 湿度74% / 日照13.92h / 晴れ）で 0 点に
    張り付いていた回帰。
    """
    day = day_elements(31.5, 74.0, 13.92, "clear")
    stars = [n for n, _ in daily_areas(CHART, GROUPS, day, "金", is_male=True).values()]
    assert any(0 < n < MAX_STARS for n in stars), stars


def test_reachable_days_cover_the_whole_input_range():
    """基準は day_elements が丸める範囲を端まで含む。"""
    hottest = day_elements(TEMP_RANGE[1], 0.0, DAYLIGHT_RANGE[1], "clear")
    coldest = day_elements(TEMP_RANGE[0], 100.0, DAYLIGHT_RANGE[0], "snow")
    assert hottest in REACHABLE_DAYS
    assert coldest in REACHABLE_DAYS


# --- 分野別の星 ---------------------------------------------------------


def test_areas_cover_the_four_and_stay_on_the_star_scale():
    scored = daily_areas(CHART, GROUPS, day_elements(*WET_RAIN), "金", is_male=True)
    assert set(scored) == set(DAILY_AREAS)
    for stars, score in scored.values():
        assert 0 <= stars <= MAX_STARS
        assert 0.0 <= score <= 100.0


def test_every_area_uses_the_whole_star_range_over_the_year():
    """種族によっては一年中星が付かない、という状態を作らない。"""
    seen: dict[str, set[int]] = {area: set() for area in DAILY_AREAS}
    for day in REACHABLE_DAYS:
        for area, (stars, _) in daily_areas(CHART, GROUPS, day, "金", is_male=True).items():
            seen[area].add(stars)
    for area, stars in seen.items():
        assert min(stars) == 0 and max(stars) == MAX_STARS, area


def test_the_same_weather_reads_differently_for_different_day_masters():
    """同じ天気でも日主の五行が違えば分野の出方が変わる（種族ごとの形）。"""
    day = day_elements(*WET_RAIN)
    metal = daily_areas(CHART, GROUPS, day, "金", is_male=True)
    wood = daily_areas(CHART, GROUPS, day, "木", is_male=True)
    assert [metal[a][0] for a in DAILY_AREAS] != [wood[a][0] for a in DAILY_AREAS]


def test_air_groups_are_relative_to_the_day_master():
    """金の人にとっての水は食傷、木の人にとっての水は印星。"""
    day = day_elements(*WET_RAIN)
    assert air_groups(day, "金")["食傷"] == day["水"]
    assert air_groups(day, "木")["印星"] == day["水"]


def test_leading_driver_names_a_group_except_for_health():
    """健康運は五行の均衡で見るので、理由に出るのは通変星ではなく五行。"""
    day = day_elements(*WET_RAIN)
    for area in DAILY_AREAS:
        kind, driver = leading_driver(day, CHART, GROUPS, "金", area, is_male=True)
        if area == "health":
            assert kind == "element" and driver in FIVE_ELEMENTS
        else:
            assert kind == "group" and driver in TEN_GOD_GROUPS
