"""二人の命式から相性を見る。

四柱推命の用語をそのまま出しても伝わらないので、身近な四つの面に噛み砕く。

* 体 — 日支の関係（六合・三合・冲・害）と、十二運星から見た生活のテンポ
* 心 — 日主どうしの五行関係（相生・比和・相剋）と、相手の命式が自分の日主を養うか
* 思考 — 通変星グループの構成比がどれだけ似ているか
* 支え合い — 五行の足りない気を互いに埋め合えるか

各面も総合も 0〜100。素点のままだと点が中央に寄って差が読めないため、
実在の生年月日で総当たりして測った範囲（``FACET_RANGE`` / ``TOTAL_RANGE``）を
基準に 0〜100 へ引き伸ばしている。したがって返る総合点は各面の加重平均そのもの
ではなく、加重平均を同じやり方で引き伸ばした値になる。

文言は返さず、フロントが訳せるようコード（notes）だけを返す。
"""

import math
from typing import NamedTuple

from app.schemas.fortune import Pillar
from app.services.saju.analysis import element_ratios, ten_god_group_ratios
from app.services.saju.constants import (
    CLASH,
    CONTROLS,
    FIVE_ELEMENTS,
    GENERATES,
    HARM,
    SIX_HARMONY,
    STEM_ELEMENT,
    STEM_YANG,
    TEN_GOD_GROUPS,
    THREE_HARMONY,
    TWELVE_STAGE_ENERGY,
)
from app.services.saju.twelve_stages import twelve_stage

# 面の重み（合計 1.0）
FACET_WEIGHTS = {"body": 0.25, "heart": 0.3, "mind": 0.2, "support": 0.25}

# 五行が均等なときの構成比
BALANCED = 1 / len(FIVE_ELEMENTS)

# 日主どうしの関係の点数。相生が最も噛み合い、相剋が最も噛み合わない。
DAY_MASTER_SCORES = {
    "generates": 100.0,  # 自分が相手を生む
    "generated": 100.0,  # 相手が自分を生む
    "same_mixed": 72.0,  # 同じ五行・陰陽違い
    "same": 48.0,  # 同じ五行・陰陽同じ
    "controls": 0.0,  # 自分が相手を剋す
    "controlled": 0.0,  # 相手が自分を剋す
}

# 日支どうしの関係の点数。六合が最も結びつき、冲が最もぶつかる。
BRANCH_SCORES = {
    "six_harmony": 100.0,
    "three_harmony": 85.0,
    "same": 55.0,
    "neutral": 40.0,
    "harm": 18.0,
    "clash": 0.0,
}

# 各面の素点が実際に取りうる範囲。
# 日支や日主の関係は理屈の上では 0〜100 だが、そこに生活のテンポや五行を
# 混ぜると実在の生年月日では両端に届かない。素点のままだと点が中央に寄って
# 差が読めないので、実測した範囲を 0〜100 に引き伸ばして返す。
#
# 値は scratchpad の sweep.py で、1950〜2009 の生年月日 560 件・156,520 ペアを
# 総当たりして得た最小・最大。重みや配点を変えたときは測り直すこと。
FACET_RANGE = {
    "body": (7.5, 100.0),
    "heart": (10.5, 96.0),
    "mind": (19.3, 100.0),
    "support": (0.0, 96.7),
}

# 引き伸ばし後の各面を重み付けした平均が取りうる範囲（同じ総当たりで実測）。
# 4面の平均は中央に寄るため、総合も同じように引き伸ばす。
TOTAL_RANGE = (12.9, 89.8)

# 思考の似方をどこで「似ている」と言うか（引き伸ばし後の点）
MIND_ALIKE_THRESHOLD = 57.0
# 支え合いをどこで「補い合っている」と言うか（引き伸ばし後の点）
SUPPORT_COMPLEMENT_THRESHOLD = 41.0


def _rescale(value: float, span: tuple[float, float]) -> float:
    """素点を、実測した範囲 ``span`` を基準に 0〜100 へ引き伸ばす。"""
    low, high = span
    if high <= low:
        return value
    return min(100.0, max(0.0, (value - low) / (high - low) * 100))


def _day_master_relation(a: str, b: str) -> str:
    """日主どうしがどの関係にあるかを返す。"""
    el_a, el_b = STEM_ELEMENT[a], STEM_ELEMENT[b]

    if el_a == el_b:
        return "same" if STEM_YANG[a] == STEM_YANG[b] else "same_mixed"
    if GENERATES[el_a] == el_b:
        return "generates"
    if GENERATES[el_b] == el_a:
        return "generated"
    if CONTROLS[el_a] == el_b:
        return "controls"
    return "controlled"


def _branch_relation(a: str, b: str) -> str:
    """日支どうしがどの関係にあるかを返す。"""
    if SIX_HARMONY.get(a) == b:
        return "six_harmony"
    # 同支は三合ではなく比和。全ての支が何らかの三合に属するため、
    # この判定を三合より先に置かないと同支が三合として拾われてしまう。
    if a == b:
        return "same"
    if any(a in triad and b in triad for triad in THREE_HARMONY):
        return "three_harmony"
    if CLASH.get(a) == b:
        return "clash"
    if HARM.get(a) == b:
        return "harm"
    return "neutral"


def _nourishment(day_master: str, other: dict[str, float]) -> float:
    """相手の命式が自分の日主をどれだけ養うか（0〜100）。

    日主を生む五行と日主と同じ五行は力を与え、日主を剋す五行は削る。
    """
    element = STEM_ELEMENT[day_master]
    generator = next(el for el, made in GENERATES.items() if made == element)
    controller = next(el for el, ruled in CONTROLS.items() if ruled == element)
    # 与える気から削る気を引く。構成比なので -1〜1 に収まる。
    raw = other[generator] + other[element] - other[controller]
    return (raw + 1) / 2 * 100


def _pace(pillars: dict[str, Pillar]) -> float:
    """十二運星のエネルギーで測った、その人の勢いの平均（1〜12）。"""
    day_master = pillars["day"].stem
    energies = [TWELVE_STAGE_ENERGY[twelve_stage(day_master, p.branch)] for p in pillars.values()]
    return sum(energies) / len(energies)


def _tempo(a: dict[str, Pillar], b: dict[str, Pillar]) -> float:
    """生活のテンポの近さ（0〜100）。勢いが揃っているほど高い。"""
    span = max(TWELVE_STAGE_ENERGY.values()) - min(TWELVE_STAGE_ENERGY.values())
    return 100 * (1 - abs(_pace(a) - _pace(b)) / span)


def _evenness(ratios: dict[str, float]) -> float:
    """五行の均衡度（0〜100）。均等なら100、一行に偏るほど0に近づく。"""
    # 均等(0.2)からのずれの合計。最大は一行に集中したときの 1.6。
    return (1 - sum(abs(ratios[el] - BALANCED) for el in FIVE_ELEMENTS) / 1.6) * 100


def _body_facet(a: dict[str, Pillar], b: dict[str, Pillar]) -> tuple[float, str]:
    """体の相性。日支の縁を軸に、生活のテンポで寄せる。"""
    relation = _branch_relation(a["day"].branch, b["day"].branch)
    raw = 0.7 * BRANCH_SCORES[relation] + 0.3 * _tempo(a, b)
    return _rescale(raw, FACET_RANGE["body"]), f"branch.{relation}"


def _heart_facet(a: dict[str, Pillar], b: dict[str, Pillar]) -> tuple[float, str]:
    """心の相性。日主どうしの関係を軸に、互いを養う度合いで寄せる。"""
    dm_a, dm_b = a["day"].stem, b["day"].stem
    relation = _day_master_relation(dm_a, dm_b)
    nourish = (
        _nourishment(dm_a, element_ratios(b)) + _nourishment(dm_b, element_ratios(a))
    ) / 2
    raw = 0.65 * DAY_MASTER_SCORES[relation] + 0.35 * nourish
    return _rescale(raw, FACET_RANGE["heart"]), f"day_master.{relation}"


def _mind_facet(a: dict[str, Pillar], b: dict[str, Pillar]) -> tuple[float, str]:
    """思考の相性。通変星グループの構成比が似ているほど考え方が近い。"""
    ratios_a, ratios_b = ten_god_group_ratios(a), ten_god_group_ratios(b)
    # 総変動距離。0=全く同じ構成、1=全く重ならない構成。
    distance = sum(abs(ratios_a[g] - ratios_b[g]) for g in TEN_GOD_GROUPS) / 2
    score = _rescale(100 * (1 - distance), FACET_RANGE["mind"])
    return score, "mind.alike" if score >= MIND_ALIKE_THRESHOLD else "mind.different"


def _support_facet(a: dict[str, Pillar], b: dict[str, Pillar]) -> tuple[float, str]:
    """支え合い。二人を合わせたとき、偏りがどれだけ解消されるか。

    偏りの大きい方を基準に、残っていた偏りの何割が埋まったかを見る。
    片方の偏りがそのまま残れば 0、二人で完全に均衡すれば 100。
    """
    ratios_a, ratios_b = element_ratios(a), element_ratios(b)
    merged = {el: (ratios_a[el] + ratios_b[el]) / 2 for el in FIVE_ELEMENTS}

    alone = min(_evenness(ratios_a), _evenness(ratios_b))
    if alone >= 100:
        return 100.0, "element.complements"  # もともと二人とも均衡している
    raw = max(0.0, (_evenness(merged) - alone) / (100 - alone) * 100)
    score = _rescale(raw, FACET_RANGE["support"])
    return score, (
        "element.complements" if score >= SUPPORT_COMPLEMENT_THRESHOLD else "element.similar"
    )


class ComparisonChart(NamedTuple):
    """判断の根拠を二人分重ねて見せるためのレーダー値。"""

    key: str
    axes: list[str]
    you: list[float]
    them: list[float]
    max_value: float
    highlight: list[str]  # その判断の決め手になった軸


def _chart_ceiling(values: list[float]) -> float:
    """外周の目盛り。10刻みで切り上げ、低すぎて潰れないよう下限を置く。"""
    return max(40.0, math.ceil(max(values) / 10) * 10)


def comparison_charts(
    a_pillars: dict[str, Pillar], b_pillars: dict[str, Pillar]
) -> list[ComparisonChart]:
    """「支え合い」と「考え方」の判断根拠を、二人分の構成比として返す。

    体・心は日支と日主という一点の関係から決まるので図にならない。
    構成比で決めているこの二つだけを重ね合わせの対象にする。
    """
    ratios_a, ratios_b = element_ratios(a_pillars), element_ratios(b_pillars)
    groups_a, groups_b = ten_god_group_ratios(a_pillars), ten_god_group_ratios(b_pillars)

    # 支え合い: 片方が平均より少なく、もう片方が多い五行。ここで補い合いが起きる。
    complementing = [
        el for el in FIVE_ELEMENTS if (ratios_a[el] < BALANCED) != (ratios_b[el] < BALANCED)
    ]
    if not complementing:
        # 補い合いが無いときは、二人とも足りない五行が共通の弱点になる。
        complementing = [
            el for el in FIVE_ELEMENTS if ratios_a[el] < BALANCED and ratios_b[el] < BALANCED
        ]

    # 考え方: 構成比の開きが大きい上位2つが、違いを生んでいる軸。
    widest = sorted(TEN_GOD_GROUPS, key=lambda g: abs(groups_a[g] - groups_b[g]), reverse=True)

    def pct(ratios: dict[str, float], keys: list[str]) -> list[float]:
        return [round(ratios[k] * 100, 1) for k in keys]

    elements_you, elements_them = pct(ratios_a, FIVE_ELEMENTS), pct(ratios_b, FIVE_ELEMENTS)
    groups_you, groups_them = pct(groups_a, TEN_GOD_GROUPS), pct(groups_b, TEN_GOD_GROUPS)

    return [
        ComparisonChart(
            key="five_elements",
            axes=list(FIVE_ELEMENTS),
            you=elements_you,
            them=elements_them,
            max_value=_chart_ceiling(elements_you + elements_them),
            highlight=complementing,
        ),
        ComparisonChart(
            key="ten_god_groups",
            axes=list(TEN_GOD_GROUPS),
            you=groups_you,
            them=groups_them,
            max_value=_chart_ceiling(groups_you + groups_them),
            highlight=widest[:2],
        ),
    ]


def compatibility(
    a_pillars: dict[str, Pillar], b_pillars: dict[str, Pillar]
) -> tuple[float, dict[str, float], list[str]]:
    """相性の総合点・内訳・説明コードを返す。

    ``*_pillars`` は ``calculate_four_pillars`` と同じ ``{"year": Pillar, ...}``。
    """
    facets: dict[str, float] = {}
    notes: list[str] = []

    for code, facet in {
        "body": _body_facet,
        "heart": _heart_facet,
        "mind": _mind_facet,
        "support": _support_facet,
    }.items():
        value, note = facet(a_pillars, b_pillars)
        facets[code] = round(value, 1)
        notes.append(note)

    # 4面の加重平均はどうしても中央に寄るので、総合も実測の範囲で引き伸ばす。
    weighted = sum(facets[code] * weight for code, weight in FACET_WEIGHTS.items())
    return round(_rescale(weighted, TOTAL_RANGE), 1), facets, notes
