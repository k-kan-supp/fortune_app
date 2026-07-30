import pytest

from app.schemas.fortune import Pillar
from app.services.saju.analysis import build_charts
from app.services.saju.constants import BRANCH_HIDDEN_STEMS, STEM_ELEMENT
from app.services.saju.ten_gods import ten_god


def make_pillar(stem: str, branch: str, day_master: str) -> Pillar:
    return Pillar(
        stem=stem,
        branch=branch,
        element=STEM_ELEMENT[stem],
        ten_god=ten_god(day_master, stem),
        hidden_stems=BRANCH_HIDDEN_STEMS[branch],
    )


# 1990-05-15 10:00 生まれ相当の命式（日主 庚）
DAY_MASTER = "庚"
PILLARS = {
    "year": make_pillar("庚", "午", DAY_MASTER),
    "month": make_pillar("辛", "巳", DAY_MASTER),
    "day": make_pillar("庚", "辰", DAY_MASTER),
    "hour": make_pillar("辛", "巳", DAY_MASTER),
}


def axes_by_key(
    pillars: dict[str, Pillar], day_master: str, is_male: bool = True
) -> dict[str, dict[str, float]]:
    """チャートキー → {軸コード: 値} に均して引きやすくする。"""
    return {
        c.key: {a.code: a.value for a in c.axes}
        for c in build_charts(pillars, day_master, is_male)
    }


@pytest.fixture
def charts() -> dict[str, dict[str, float]]:
    return axes_by_key(PILLARS, DAY_MASTER)


def test_returns_all_ten_charts():
    keys = [c.key for c in build_charts(PILLARS, DAY_MASTER, True)]
    assert keys == [
        "five_elements",
        "ten_stems",
        "twelve_branches",
        "ten_gods",
        "ten_god_groups",
        "twelve_stages",
        "pillar_energy",
        "seasonal_states",
        "personality",
        "life_areas",
    ]


def test_no_axis_exceeds_its_chart_max():
    for chart in build_charts(PILLARS, DAY_MASTER, True):
        assert chart.max_value > 0, chart.key
        for axis in chart.axes:
            assert 0 <= axis.value <= chart.max_value, f"{chart.key}.{axis.code}"


def test_five_elements_and_ten_stems_share_a_total(charts):
    # 五行は十干を束ねたものなので、合計点は一致する
    assert sum(charts["five_elements"].values()) == pytest.approx(
        sum(charts["ten_stems"].values())
    )


def test_branch_and_stage_distributions_count_four_pillars(charts):
    assert sum(charts["twelve_branches"].values()) == 4
    assert sum(charts["twelve_stages"].values()) == 4
    # 巳が2つ(月・時)、午と辰が1つずつ
    assert charts["twelve_branches"]["巳"] == 2
    assert charts["twelve_branches"]["午"] == 1


def test_pillar_energy_follows_the_twelve_stages(charts):
    # 庚から見て 午=沐浴(7) 巳=長生(9) 辰=養(6)
    assert charts["pillar_energy"] == {"year": 7, "month": 9, "day": 6, "hour": 9}


def test_seasonal_states_are_keyed_off_the_month_branch(charts):
    # 月支が巳＝夏なので火が旺じ、相=土・休=木・囚=水・死=金 に割り当たる
    elements = charts["five_elements"]
    assert charts["seasonal_states"]["旺"] == elements["火"]
    assert charts["seasonal_states"]["相"] == elements["土"]
    assert charts["seasonal_states"]["休"] == elements["木"]
    assert charts["seasonal_states"]["囚"] == elements["水"]
    assert charts["seasonal_states"]["死"] == elements["金"]


def test_ten_god_groups_sum_their_pairs(charts):
    gods, groups = charts["ten_gods"], charts["ten_god_groups"]
    assert groups["比劫"] == pytest.approx(gods["比肩"] + gods["劫財"])
    assert groups["官殺"] == pytest.approx(gods["偏官"] + gods["正官"])
    assert groups["印星"] == pytest.approx(gods["偏印"] + gods["印綬"])


def test_love_fortune_differs_by_gender():
    # 男命は財星、女命は官星を恋愛の主星とするため値が入れ替わる
    def love(is_male: bool) -> float:
        return axes_by_key(PILLARS, DAY_MASTER, is_male)["life_areas"]["love"]

    assert love(True) != love(False)


def test_personality_and_life_areas_stay_within_percent_scale(charts):
    for values in (charts["personality"], charts["life_areas"]):
        assert all(0 <= v <= 100 for v in values.values())


def test_balanced_chart_scores_high_on_health():
    # 木火土金水が一巡する命式は五行の均衡度が高く出る
    balanced_dm = "甲"
    balanced = {
        "year": make_pillar("甲", "寅", balanced_dm),  # 木
        "month": make_pillar("丙", "申", balanced_dm),  # 火 / 金
        "day": make_pillar("甲", "子", balanced_dm),  # 木 / 水
        "hour": make_pillar("戊", "辰", balanced_dm),  # 土
    }
    even = axes_by_key(balanced, balanced_dm)
    skewed = axes_by_key(PILLARS, DAY_MASTER)
    assert even["life_areas"]["health"] > skewed["life_areas"]["health"]
