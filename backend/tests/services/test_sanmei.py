"""算命学の陽占（人体星図）。

星の名前は四柱推命の十神・十二運星の読み替えなので、
ここでは「読み替えが一対一であること」と「どこから引いてくるか」を確かめる。
"""

from app.schemas.fortune import FortuneRequest
from app.services.saju.constants import TEN_GODS, TWELVE_STAGE_ENERGY, TWELVE_STAGES
from app.services.saju.pillars import calculate_four_pillars
from app.services.saju.sanmei import FOLLOWER_STAR, MAIN_STAR, sanmei
from app.services.saju.ten_gods import ten_god
from app.services.saju.twelve_stages import twelve_stage
from tests.services.test_analysis import DAY_MASTER, PILLARS


def by_position(chart) -> dict[str, str]:
    return {s.position: s.star for s in chart.stars}


def test_star_tables_cover_every_ten_god_and_stage_one_to_one():
    assert set(MAIN_STAR) == set(TEN_GODS)
    assert len(set(MAIN_STAR.values())) == 10
    assert set(FOLLOWER_STAR) == set(TWELVE_STAGES)
    assert len(set(FOLLOWER_STAR.values())) == 12


def test_each_position_reads_the_documented_source():
    """5か所の主星が、それぞれ決められた干から出ている。"""
    chart = sanmei(PILLARS, DAY_MASTER)
    pos = by_position(chart)
    star_of = lambda stem: MAIN_STAR[ten_god(DAY_MASTER, stem)]  # noqa: E731

    assert pos["head"] == star_of(PILLARS["year"].stem)
    assert pos["belly"] == star_of(PILLARS["month"].stem)
    assert pos["left_hand"] == star_of(PILLARS["year"].hidden_stems[0])
    assert pos["chest"] == star_of(PILLARS["month"].hidden_stems[0])
    assert pos["right_hand"] == star_of(PILLARS["day"].hidden_stems[0])


def test_center_star_is_the_chest():
    chart = sanmei(PILLARS, DAY_MASTER)
    assert chart.center == by_position(chart)["chest"]


def test_followers_run_year_month_day_over_the_three_life_stages():
    chart = sanmei(PILLARS, DAY_MASTER)
    expected = [("early", "year"), ("middle", "month"), ("late", "day")]
    assert [f.period for f in chart.followers] == [p for p, _ in expected]

    for follower, (_, code) in zip(chart.followers, expected, strict=True):
        branch = PILLARS[code].branch
        stage = twelve_stage(DAY_MASTER, branch)
        assert follower.branch == branch
        assert follower.star == FOLLOWER_STAR[stage]
        assert follower.energy == TWELVE_STAGE_ENERGY[stage]


def test_energy_total_is_the_sum_of_the_three_followers():
    chart = sanmei(PILLARS, DAY_MASTER)
    assert chart.energy_total == sum(f.energy for f in chart.followers)
    assert 3 <= chart.energy_total <= 36  # 天馳星1×3 〜 天将星12×3


def test_energy_table_matches_the_sanmei_point_table():
    """十二大従星の点数表（合計78）と、既存の十二運星エネルギーが一致する。"""
    assert sum(TWELVE_STAGE_ENERGY.values()) == 78
    assert TWELVE_STAGE_ENERGY["帝旺"] == 12  # 天将星
    assert TWELVE_STAGE_ENERGY["絶"] == 1  # 天馳星


def test_every_reading_carries_a_star_chart():
    result = calculate_four_pillars(
        FortuneRequest(year=1990, month=5, day=15, hour=10, minute=0, is_male=True)
    )
    assert result.sanmei is not None
    assert len(result.sanmei.stars) == 5
    assert len(result.sanmei.followers) == 3
