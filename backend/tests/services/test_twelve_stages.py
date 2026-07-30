from app.services.saju.constants import EARTHLY_BRANCHES, HEAVENLY_STEMS, TWELVE_STAGES
from app.services.saju.twelve_stages import twelve_stage


def test_yang_stem_runs_forward():
    # 甲(陽干) は亥を長生として順行する
    assert twelve_stage("甲", "亥") == "長生"
    assert twelve_stage("甲", "子") == "沐浴"
    assert twelve_stage("甲", "寅") == "建禄"
    assert twelve_stage("甲", "卯") == "帝旺"


def test_yin_stem_runs_backward():
    # 乙(陰干) は午を長生として逆行する
    assert twelve_stage("乙", "午") == "長生"
    assert twelve_stage("乙", "巳") == "沐浴"
    assert twelve_stage("乙", "卯") == "建禄"
    assert twelve_stage("乙", "寅") == "帝旺"


def test_every_stem_covers_all_twelve_stages():
    # どの日干でも、12支をひと巡りすれば12運星が1回ずつ現れる
    for stem in HEAVENLY_STEMS:
        stages = [twelve_stage(stem, branch) for branch in EARTHLY_BRANCHES]
        assert sorted(stages) == sorted(TWELVE_STAGES)
