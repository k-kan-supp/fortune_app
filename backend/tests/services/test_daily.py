"""日運（その日の気象から出す運勢）。

外部通信はテストしない。気象の観測値を渡したときの振る舞いだけを見る。
"""

import pytest

from app.services.saju.analysis import element_ratios
from app.services.saju.constants import FIVE_ELEMENTS
from app.services.saju.daily import (
    DAYLIGHT_RANGE,
    REACHABLE_DAYS,
    SKY_CODES,
    TEMP_RANGE,
    balance_gain,
    daily_score,
    day_elements,
    element_moves,
    personal_span,
    sky_of,
)
from tests.services.test_analysis import PILLARS

CHART = element_ratios(PILLARS)  # 金に寄り、水がほとんど無い命式

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


def test_score_is_higher_when_the_air_supplies_what_the_chart_lacks():
    """この命式は水が薄い。水を足す日のほうが、金を足す日より高く出る。"""
    rainy = balance_gain(CHART, day_elements(*WET_RAIN))
    dry = balance_gain(CHART, day_elements(20.0, 25.0, 12.0, "clear"))
    assert rainy > dry


def test_balance_gain_goes_negative_when_the_day_deepens_the_imbalance():
    """悪化した日を 0 に刈り取ると、偏った命式がいつ見ても 0 点になる。

    素点は負に落ちるままにして、刈り取りは正規化のあとで行う。
    """
    gains = [balance_gain(CHART, day) for day in REACHABLE_DAYS]
    assert min(gains) < 0, "偏りを深める日が 0 に潰れている"
    assert max(gains) > 0


def test_real_midsummer_reading_is_not_pinned_to_zero():
    """実測が基準の外に出ると端に張り付く。基準は入力空間の全域を覆うこと。

    2026-08-02 の東京（31.5℃ / 湿度74% / 日照13.92h / 晴れ）で 0 点に
    張り付いていた回帰。
    """
    score = daily_score(CHART, day_elements(31.5, 74.0, 13.92, "clear"))
    assert 0.0 < score < 100.0


def test_reachable_days_cover_the_whole_input_range():
    """基準は day_elements が丸める範囲を端まで含む。"""
    hottest = day_elements(TEMP_RANGE[1], 0.0, DAYLIGHT_RANGE[1], "clear")
    coldest = day_elements(TEMP_RANGE[0], 100.0, DAYLIGHT_RANGE[0], "snow")
    assert hottest in REACHABLE_DAYS
    assert coldest in REACHABLE_DAYS


def test_daily_score_uses_the_whole_scale_for_any_chart():
    """本人が1年で取りうる幅を 0〜100 に伸ばすので、誰でも両端に届く。"""
    scores = [daily_score(CHART, day) for day in REACHABLE_DAYS]
    assert min(scores) == 0.0
    assert max(scores) == 100.0


def test_personal_span_is_measured_over_reachable_weather():
    """下端は負になりうる（偏りを深める日）。刈り取るのは正規化のあと。"""
    low, high = personal_span(CHART)
    assert low < high
    assert low == min(balance_gain(CHART, day) for day in REACHABLE_DAYS)
    assert high == max(balance_gain(CHART, day) for day in REACHABLE_DAYS)


def test_element_moves_split_by_what_the_chart_already_has():
    day = day_elements(*WET_RAIN)
    fills, floods = element_moves(CHART, day)
    balanced = 1 / len(FIVE_ELEMENTS)
    assert all(CHART[el] < balanced and day[el] > CHART[el] for el in fills)
    assert all(CHART[el] > balanced and day[el] > CHART[el] for el in floods)
    assert not set(fills) & set(floods)
