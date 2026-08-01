"""命式から各種バランス指標（レーダーチャート用）を算出する。

チャートは全て ``RadarChart`` の形に揃えてあり、フロントは ``key`` で表題を、
``axes[].code`` で軸ラベルを引く。数値の意味はチャートごとに異なるため、
外周にあたる値を ``max_value`` として一緒に返す。
"""

import math

from app.schemas.fortune import Pillar, RadarAxis, RadarChart
from app.services.saju.constants import (
    CONTROLS,
    EARTHLY_BRANCHES,
    FIVE_ELEMENTS,
    GENERATES,
    HEAVENLY_STEMS,
    HIDDEN_STEM_WEIGHTS,
    MONTH_HIDDEN_STEM_WEIGHTS,
    SEASON_ELEMENT,
    SEASONAL_STATES,
    STEM_ELEMENT,
    STEM_WEIGHT,
    TEN_GOD_GROUP,
    TEN_GOD_GROUPS,
    TEN_GODS,
    TWELVE_STAGE_ENERGY,
    TWELVE_STAGES,
)
from app.services.saju.ten_gods import ten_god
from app.services.saju.twelve_stages import twelve_stage

# 柱のコード（フロントは既存の年柱・月柱…の訳語を再利用する）
PILLAR_CODES = ["year", "month", "day", "hour"]

# 性格特性: 通変星グループの構成比に掛ける重み。
# 各行の最大の重みを 1.0 に揃えてあるので、その主グループに偏った命式ほど 100 に近づく。
PERSONALITY_WEIGHTS: dict[str, dict[str, float]] = {
    "independence": {"比劫": 1.0, "食傷": 0.3, "印星": 0.2},
    "expression": {"食傷": 1.0, "財星": 0.3, "比劫": 0.2},
    "sociability": {"財星": 1.0, "食傷": 0.7, "比劫": 0.3, "官殺": 0.2},
    "action": {"官殺": 1.0, "財星": 0.7, "比劫": 0.6, "食傷": 0.2},
    "discipline": {"官殺": 1.0, "印星": 0.5, "財星": 0.3},
    "curiosity": {"印星": 1.0, "食傷": 0.4, "官殺": 0.2},
}

# 分野別運勢: 同じく通変星グループの構成比から算出する。
# 恋愛運は男命が財星（妻星）、女命が官星（夫星）を主星とする古典に従って分ける。
LIFE_AREA_WEIGHTS: dict[str, dict[str, float]] = {
    "career": {"官殺": 1.0, "印星": 0.6, "財星": 0.4},
    "wealth": {"財星": 1.0, "食傷": 0.6, "比劫": 0.2},
    "love_male": {"財星": 1.0, "食傷": 0.5, "印星": 0.2},
    "love_female": {"官殺": 1.0, "財星": 0.5, "印星": 0.2},
    "relationships": {"比劫": 1.0, "食傷": 0.7, "印星": 0.3},
    "study": {"印星": 1.0, "食傷": 0.5, "官殺": 0.3},
}

LIFE_AREA_ORDER = ["career", "wealth", "love", "health", "relationships", "study"]


def _weighted_stems(pillars: dict[str, Pillar]) -> list[tuple[str, float]]:
    """命式に現れる天干を重み付きで列挙する（表に出た天干＋地支の蔵干）。"""
    weighted: list[tuple[str, float]] = []
    for code, pillar in pillars.items():
        weighted.append((pillar.stem, STEM_WEIGHT))
        hidden = MONTH_HIDDEN_STEM_WEIGHTS if code == "month" else HIDDEN_STEM_WEIGHTS
        # 蔵干は1〜3個。重みは本気から順に当て、足りない分は使わない
        for stem, weight in zip(pillar.hidden_stems, hidden, strict=False):
            weighted.append((stem, weight))
    return weighted


def _tally(
    weighted: list[tuple[str, float]], key: dict[str, str] | None = None
) -> dict[str, float]:
    """重み付きの天干を、必要なら ``key`` で写像してから合計する。"""
    totals: dict[str, float] = {}
    for stem, weight in weighted:
        name = key[stem] if key else stem
        totals[name] = totals.get(name, 0.0) + weight
    return totals


def _nice_max(values: dict[str, float]) -> float:
    """外周の目盛りを 0.5 刻みの切りの良い値に丸める。"""
    return max(math.ceil(max(values.values(), default=0.0) * 2) / 2, 0.5)


def _count_max(values: dict[str, float]) -> float:
    """出現数のチャートの外周値。

    四柱しかないので理論上の最大は 4 だが、そこに固定すると 0 の軸が多い
    十二支・十二運星の形が中心に潰れて読めない。実際の最大に合わせて広げ、
    目盛りの表示で尺度が分かるようにする。
    """
    return max(math.ceil(max(values.values(), default=0.0)), 1.0)


def _ratios(totals: dict[str, float], keys: list[str]) -> dict[str, float]:
    """合計が 1 になる構成比。全て 0 のときは均等とみなす。"""
    total = sum(totals.get(k, 0.0) for k in keys)
    if total <= 0:
        return {k: 1 / len(keys) for k in keys}
    return {k: totals.get(k, 0.0) / total for k in keys}


def _blend(weights: dict[str, float], ratios: dict[str, float]) -> float:
    """構成比に重みを掛けて 0〜100 のスコアにする。"""
    score = sum(weight * ratios.get(group, 0.0) for group, weight in weights.items())
    return round(min(score, 1.0) * 100, 1)


def element_ratios(pillars: dict[str, Pillar]) -> dict[str, float]:
    """命式の五行構成比（合計 1）。相性判定などチャート以外からも使う。"""
    return _ratios(_tally(_weighted_stems(pillars), STEM_ELEMENT), FIVE_ELEMENTS)


def ten_god_group_ratios(pillars: dict[str, Pillar]) -> dict[str, float]:
    """通変星グループの構成比（合計 1）。日主は日柱の天干から取る。"""
    day_master = pillars["day"].stem
    groups = {s: TEN_GOD_GROUP[ten_god(day_master, s)] for s in HEAVENLY_STEMS}
    return _ratios(_tally(_weighted_stems(pillars), groups), TEN_GOD_GROUPS)


def _element_evenness(element_ratios: dict[str, float]) -> float:
    """五行の均衡度を 0〜100 で返す（均等なら100、一行に偏るほど0に近づく）。"""
    # 構成比が均等(0.2)からどれだけ離れているか。最大のずれは一行集中時の 1.6。
    deviation = sum(abs(element_ratios[el] - 1 / len(FIVE_ELEMENTS)) for el in FIVE_ELEMENTS)
    return round((1 - deviation / 1.6) * 100, 1)


def _seasonal_state_elements(month_branch: str) -> dict[str, str]:
    """月支が司る季節から、旺相休囚死それぞれに当たる五行を求める。"""
    ruling = SEASON_ELEMENT[month_branch]
    generated_by = next(el for el, gen in GENERATES.items() if gen == ruling)
    controlled_by = next(el for el, con in CONTROLS.items() if con == ruling)
    return {
        "旺": ruling,  # 当令。その季節に最も勢いのある五行
        "相": GENERATES[ruling],  # 当令が生む五行
        "休": generated_by,  # 当令を生み終えて休む五行
        "囚": controlled_by,  # 当令を剋そうとして閉じ込められる五行
        "死": CONTROLS[ruling],  # 当令に剋される五行
    }


# 同点の軸がこれより多く並ぶ側は、強み／弱みとして挙げない。
# 「出現しない地支が8つ」のような並びを弱みと呼んでも、読む側の情報にならない。
_EXTREME_MAX_TIED = 2


def _extremes(axes: list[RadarAxis]) -> tuple[list[str], list[str]]:
    """際立って高い軸と低い軸のコードを返す。

    全軸が同じ値の平坦な図では、どちらも空にする（順位を付ける意味がないため）。
    """
    values = [axis.value for axis in axes]
    if len(set(values)) < 2:
        return [], []

    highs = [axis.code for axis in axes if axis.value == max(values)]
    lows = [axis.code for axis in axes if axis.value == min(values)]
    return (
        highs if len(highs) <= _EXTREME_MAX_TIED else [],
        lows if len(lows) <= _EXTREME_MAX_TIED else [],
    )


def _chart(key: str, values: dict[str, float], order: list[str], max_value: float) -> RadarChart:
    axes = [RadarAxis(code=code, value=round(values.get(code, 0.0), 1)) for code in order]
    strengths, weaknesses = _extremes(axes)
    return RadarChart(
        key=key,
        max_value=max_value,
        axes=axes,
        strengths=strengths,
        weaknesses=weaknesses,
    )


def build_charts(pillars: dict[str, Pillar], day_master: str, is_male: bool) -> list[RadarChart]:
    """命式から10種類のレーダーチャートを組み立てる。"""
    weighted = _weighted_stems(pillars)
    branches = [p.branch for p in pillars.values()]

    stem_scores = _tally(weighted)
    element_scores = _tally(weighted, STEM_ELEMENT)
    gods = {s: ten_god(day_master, s) for s in HEAVENLY_STEMS}
    god_scores = _tally(weighted, gods)
    group_scores = _tally(weighted, {s: TEN_GOD_GROUP[g] for s, g in gods.items()})

    branch_counts = {b: float(branches.count(b)) for b in EARTHLY_BRANCHES}
    stages = {code: twelve_stage(day_master, p.branch) for code, p in pillars.items()}
    stage_list = list(stages.values())
    stage_counts = {s: float(stage_list.count(s)) for s in TWELVE_STAGES}
    pillar_energy = {code: float(TWELVE_STAGE_ENERGY[stage]) for code, stage in stages.items()}

    state_elements = _seasonal_state_elements(pillars["month"].branch)
    state_scores = {state: element_scores.get(el, 0.0) for state, el in state_elements.items()}

    group_ratios = _ratios(group_scores, TEN_GOD_GROUPS)
    element_ratios = _ratios(element_scores, FIVE_ELEMENTS)

    personality = {
        trait: _blend(weights, group_ratios) for trait, weights in PERSONALITY_WEIGHTS.items()
    }

    love_key = "love_male" if is_male else "love_female"
    life_areas = {
        "career": _blend(LIFE_AREA_WEIGHTS["career"], group_ratios),
        "wealth": _blend(LIFE_AREA_WEIGHTS["wealth"], group_ratios),
        "love": _blend(LIFE_AREA_WEIGHTS[love_key], group_ratios),
        # 健康運だけは通変星ではなく五行の偏りの少なさ（均衡度）で測る。
        "health": _element_evenness(element_ratios),
        "relationships": _blend(LIFE_AREA_WEIGHTS["relationships"], group_ratios),
        "study": _blend(LIFE_AREA_WEIGHTS["study"], group_ratios),
    }

    max_energy = float(max(TWELVE_STAGE_ENERGY.values()))

    return [
        _chart("five_elements", element_scores, FIVE_ELEMENTS, _nice_max(element_scores)),
        _chart("ten_stems", stem_scores, HEAVENLY_STEMS, _nice_max(stem_scores)),
        _chart("twelve_branches", branch_counts, EARTHLY_BRANCHES, _count_max(branch_counts)),
        _chart("ten_gods", god_scores, TEN_GODS, _nice_max(god_scores)),
        _chart("ten_god_groups", group_scores, TEN_GOD_GROUPS, _nice_max(group_scores)),
        _chart("twelve_stages", stage_counts, TWELVE_STAGES, _count_max(stage_counts)),
        _chart("pillar_energy", pillar_energy, PILLAR_CODES, max_energy),
        _chart("seasonal_states", state_scores, SEASONAL_STATES, _nice_max(state_scores)),
        _chart("personality", personality, list(PERSONALITY_WEIGHTS), 100.0),
        _chart("life_areas", life_areas, LIFE_AREA_ORDER, 100.0),
    ]
