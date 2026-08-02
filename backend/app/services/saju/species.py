"""命式を 25 の「種族」に振り分ける。

日主の五行（5）× 最も強い通変星グループ（5）＝ 25 通り。
日主は「何でできているか」、主星グループは「その力がどこへ向かうか」を表すので、
この 2 軸なら命式の骨格をひとことで言い当てられる。

コードは 2 文字。1 文字目が五行、2 文字目が主星グループで、フロントはこれを
キーに種族名を引く（文言はこちらでは持たない）。
"""

from app.schemas.fortune import Pillar, Species
from app.services.saju.analysis import ten_god_group_ratios
from app.services.saju.constants import STEM_ELEMENT, TEN_GOD_GROUPS

# 五行の頭文字（Wood / Fire / Earth / Metal / Aqua）
ELEMENT_LETTER = {"木": "W", "火": "F", "土": "E", "金": "M", "水": "A"}

# 主星グループの頭文字（Self / eXpress / Gain / Order / Learn）
GROUP_LETTER = {"比劫": "S", "食傷": "X", "財星": "G", "官殺": "O", "印星": "L"}


def species(pillars: dict[str, Pillar], day_master: str) -> Species:
    """命式の種族を求める。"""
    element = STEM_ELEMENT[day_master]
    ratios = ten_god_group_ratios(pillars)

    # 同率のときは TEN_GOD_GROUPS の並び順で先にあるほうを採る。
    # max は最初に見つけた最大値を返すので、この順で回すだけで結果が安定する。
    group = max(TEN_GOD_GROUPS, key=lambda g: ratios[g])

    return Species(
        code=ELEMENT_LETTER[element] + GROUP_LETTER[group],
        element=element,
        group=group,
        group_share=round(ratios[group] * 100, 1),
    )
