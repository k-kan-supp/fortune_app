from app.services.saju.ten_gods import ten_god


def test_same_element_same_polarity_is_hiken():
    # 甲(陽木) から見た 甲(陽木) → 比肩
    assert ten_god("甲", "甲") == "比肩"


def test_generated_by_day_master():
    # 甲(木) は 丙(火) を生む → 陽同士なので食神
    assert ten_god("甲", "丙") == "食神"


def test_controls_target_is_wealth():
    # 甲(木) は 戊(土) を剋す → 陽同士なので偏財
    assert ten_god("甲", "戊") == "偏財"
