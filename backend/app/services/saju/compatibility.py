"""二人の命式から相性を見る。

古典的な三つの見方を点数にして合成する。

1. 日主どうしの関係（相生・比和・相剋）— 気の合いやすさ
2. 日支どうしの関係（六合・三合・冲・害）— 縁の結びつき
3. 五行の補い — 二人を合わせたときのバランス

出す値は 0〜100。文言は返さず、フロントが訳せるようコード（notes）だけを返す。
"""

from app.schemas.fortune import Pillar
from app.services.saju.analysis import element_evenness, element_ratios
from app.services.saju.constants import (
    CLASH,
    CONTROLS,
    FIVE_ELEMENTS,
    GENERATES,
    HARM,
    SIX_HARMONY,
    STEM_ELEMENT,
    STEM_YANG,
    THREE_HARMONY,
)

# 合成の重み（合計 1.0）
FACET_WEIGHTS = {"day_master": 0.35, "branch": 0.3, "element": 0.35}


def _day_master_facet(a: str, b: str) -> tuple[float, str]:
    """日主どうしの関係を点数と説明コードにする。"""
    el_a, el_b = STEM_ELEMENT[a], STEM_ELEMENT[b]
    same_polarity = STEM_YANG[a] == STEM_YANG[b]

    if el_a == el_b:
        # 同じ五行。陰陽が違えば補い合い、同じだと似すぎて競いやすい。
        return (80.0, "day_master.same_mixed") if not same_polarity else (70.0, "day_master.same")
    if GENERATES[el_a] == el_b:
        return 90.0, "day_master.generates"  # 自分が相手を生む
    if GENERATES[el_b] == el_a:
        return 90.0, "day_master.generated"  # 相手が自分を生む
    if CONTROLS[el_a] == el_b:
        return 55.0, "day_master.controls"  # 自分が相手を剋す
    return 55.0, "day_master.controlled"  # 相手が自分を剋す


def _branch_facet(a: str, b: str) -> tuple[float, str]:
    """日支どうしの関係を点数と説明コードにする。"""
    if SIX_HARMONY.get(a) == b:
        return 95.0, "branch.six_harmony"
    # 同支は三合ではなく比和。全ての支が何らかの三合に属するため、
    # この判定を三合より先に置かないと同支が三合として拾われてしまう。
    if a == b:
        return 75.0, "branch.same"
    if any(a in triad and b in triad for triad in THREE_HARMONY):
        return 90.0, "branch.three_harmony"
    if CLASH.get(a) == b:
        return 45.0, "branch.clash"
    if HARM.get(a) == b:
        return 50.0, "branch.harm"
    return 65.0, "branch.neutral"


def _element_facet(
    a_pillars: dict[str, Pillar], b_pillars: dict[str, Pillar]
) -> tuple[float, str]:
    """二人を合わせた五行のバランスを点数と説明コードにする。"""
    ratios_a = element_ratios(a_pillars)
    ratios_b = element_ratios(b_pillars)
    merged = {el: (ratios_a[el] + ratios_b[el]) / 2 for el in FIVE_ELEMENTS}

    score = element_evenness(merged)
    alone = max(element_evenness(ratios_a), element_evenness(ratios_b))
    # 一人のときより均衡が増していれば「補い合っている」と見る
    note = "element.complements" if score > alone else "element.similar"
    return score, note


def compatibility(
    a_pillars: dict[str, Pillar], b_pillars: dict[str, Pillar]
) -> tuple[float, dict[str, float], list[str]]:
    """相性の総合点・内訳・説明コードを返す。

    ``*_pillars`` は ``calculate_four_pillars`` と同じ ``{"year": Pillar, ...}``。
    """
    day_a, day_b = a_pillars["day"], b_pillars["day"]

    facets: dict[str, float] = {}
    notes: list[str] = []

    for code, (value, note) in {
        "day_master": _day_master_facet(day_a.stem, day_b.stem),
        "branch": _branch_facet(day_a.branch, day_b.branch),
        "element": _element_facet(a_pillars, b_pillars),
    }.items():
        facets[code] = round(value, 1)
        notes.append(note)

    total = sum(facets[code] * weight for code, weight in FACET_WEIGHTS.items())
    return round(total, 1), facets, notes
