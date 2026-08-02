"""25 種族の振り分け。

種族名はフロントの i18n が持つので、ここで確かめるのはコードの決まり方まで。
"""

import pytest

from app.schemas.fortune import FortuneRequest
from app.services.saju.constants import FIVE_ELEMENTS, TEN_GOD_GROUPS
from app.services.saju.pillars import calculate_four_pillars
from app.services.saju.species import ELEMENT_LETTER, GROUP_LETTER, species
from tests.services.test_analysis import DAY_MASTER, PILLARS, make_pillar


def test_code_is_the_day_master_element_and_the_strongest_group():
    kind = species(PILLARS, DAY_MASTER)
    assert kind.element == "金"  # 日主 庚 は陽の金
    assert kind.group == "比劫"
    assert kind.code == "MS"
    assert 0 < kind.group_share <= 100


def test_twenty_five_codes_are_all_distinct():
    """5 五行 × 5 グループで、コードが衝突しない。"""
    codes = {e + g for e in ELEMENT_LETTER.values() for g in GROUP_LETTER.values()}
    assert len(codes) == 25
    assert set(ELEMENT_LETTER) == set(FIVE_ELEMENTS)
    assert set(GROUP_LETTER) == set(TEN_GOD_GROUPS)


def test_element_follows_the_day_master_not_the_chart():
    """種族の1文字目は命式の最強五行ではなく、あくまで日主の五行。"""
    # 日主は乙（木）だが、命式は火に寄っている
    dm = "乙"
    pillars = {
        "year": make_pillar("丙", "午", dm),
        "month": make_pillar("丁", "巳", dm),
        "day": make_pillar("乙", "午", dm),
        "hour": make_pillar("丙", "巳", dm),
    }
    kind = species(pillars, dm)
    assert kind.element == "木"
    assert kind.code.startswith("W")


def test_ties_resolve_in_a_fixed_order():
    """同率のグループが並んでも、返るコードは実行ごとに揺れない。"""
    first = species(PILLARS, DAY_MASTER)
    assert all(species(PILLARS, DAY_MASTER) == first for _ in range(5))


@pytest.mark.parametrize(
    "year,month,day",
    [(1990, 5, 15), (1978, 11, 3), (2001, 2, 28), (1965, 7, 20), (2010, 12, 31)],
)
def test_every_reading_carries_a_species(year: int, month: int, day: int):
    """鑑定結果には必ず種族が付く（フロントは頭のサマリーで必ず使う）。"""
    result = calculate_four_pillars(
        FortuneRequest(year=year, month=month, day=day, hour=10, minute=0, is_male=True)
    )
    assert result.species is not None
    assert len(result.species.code) == 2
    assert result.species.code[0] in ELEMENT_LETTER.values()
    assert result.species.code[1] in GROUP_LETTER.values()
