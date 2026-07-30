"""十神（通変星）の判定。"""

from app.services.saju.constants import CONTROLS, GENERATES, STEM_ELEMENT, STEM_YANG


def ten_god(day_master: str, other: str) -> str:
    """日主 ``day_master`` から見た天干 ``other`` の十神名を返す。"""
    dm_el, ot_el = STEM_ELEMENT[day_master], STEM_ELEMENT[other]
    same_yin_yang = STEM_YANG[day_master] == STEM_YANG[other]

    if dm_el == ot_el:
        return "比肩" if same_yin_yang else "劫財"
    if GENERATES[dm_el] == ot_el:  # 日主が相手を生む → 食傷
        return "食神" if same_yin_yang else "傷官"
    if CONTROLS[dm_el] == ot_el:  # 日主が相手を剋す → 財
        return "偏財" if same_yin_yang else "正財"
    if CONTROLS[ot_el] == dm_el:  # 相手が日主を剋す → 官殺
        return "偏官" if same_yin_yang else "正官"
    # 残り: 相手が日主を生む → 印
    return "偏印" if same_yin_yang else "印綬"
