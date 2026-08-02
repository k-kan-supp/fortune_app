"""強み・弱みの解説文の組み立て。

文言そのものはフロントの i18n が持つので、ここで確かめるのは
「どのキーを、どの値と一緒に返すか」まで。
"""

from app.schemas.fortune import NarrativeSegment, RadarAxis
from app.services.saju.analysis import _chart, build_charts
from app.services.saju.narrative import build_note
from app.services.saju.tiers import FREE, PAID, hook_strength, preview_length
from tests.services.test_analysis import DAY_MASTER, PILLARS


def axes(values: dict[str, float]) -> list[RadarAxis]:
    return [RadarAxis(code=code, value=value) for code, value in values.items()]


def keys(segments: list[NarrativeSegment]) -> list[str]:
    return [s.key for s in segments]


def test_every_chart_with_an_extreme_gets_a_five_sentence_note():
    """強み・弱みが出るチャートには、必ず5文そろった解説が付く。"""
    for chart in build_charts(PILLARS, DAY_MASTER, True):
        for extremes, note in (
            (chart.strengths, chart.strength_note),
            (chart.weaknesses, chart.weakness_note),
        ):
            assert len(note) == (5 if extremes else 0), chart.key


def test_note_names_the_axis_and_carries_the_numbers():
    """一文目は対象の軸コードを、二文目は平均との比較に要る値を持つ。"""
    chart = _chart("five_elements", {"木": 4.0, "火": 2.0, "土": 0.0}, ["木", "火", "土"], 5.0)

    lead, spread = chart.strength_note[0], chart.strength_note[1]
    assert lead.key == "high.lead"
    assert lead.codes == ["木"]
    assert lead.params == {"value": 4.0, "max": 5.0, "count": 3}
    assert spread.params == {"average": 2.0, "diff": 2.0, "fill": 80.0}


def test_flat_chart_has_no_note():
    """順位を付けられない図には解説も付けない。"""
    chart = _chart("flat", {"a": 1.0, "b": 1.0, "c": 1.0}, ["a", "b", "c"], 1.0)
    assert chart.strength_note == []
    assert chart.weakness_note == []


def test_bands_follow_how_far_the_axis_sits_from_the_average():
    """偏りの強さは、全軸の平均に対する倍率で3段階に分かれる。"""
    # 平均は b・c に引かれるので、a の高さがそのまま倍率になる
    high_bands = {}
    for top in (10.0, 2.0, 1.2):
        chart = _chart("x", {"a": top, "b": 1.0, "c": 1.0}, ["a", "b", "c"], 12.0)
        high_bands[top] = keys(chart.strength_note)[2]
    assert high_bands == {
        10.0: "high.band.dominant",  # 平均 4.0 の 2.5 倍
        2.0: "high.band.clear",  # 平均 1.3 の 1.5 倍
        1.2: "high.band.slight",  # 平均 1.1 の 1.1 倍
    }

    low_bands = {}
    for bottom in (0.0, 1.0, 4.0):
        chart = _chart("x", {"a": 9.0, "b": 5.0, "c": bottom}, ["a", "b", "c"], 12.0)
        low_bands[bottom] = keys(chart.weakness_note)[2]
    assert low_bands == {
        0.0: "low.band.absent",
        1.0: "low.band.scarce",
        4.0: "low.band.modest",
    }


def test_hint_is_chosen_by_chart_and_side():
    """4文目はチャート固有の説明。強み用と弱み用を取り違えない。"""
    chart = _chart(
        "life_areas",
        {"career": 80.0, "wealth": 40.0, "study": 10.0},
        ["career", "wealth", "study"],
        100.0,
    )
    assert keys(chart.strength_note)[3] == "hint.life_areas.strength"
    assert keys(chart.weakness_note)[3] == "hint.life_areas.weakness"


def test_last_sentence_falls_back_when_the_other_side_is_tied_out():
    """反対側が同点だらけで挙がらないときは、落差を語らない文に差し替える。"""
    # 0 が3つ並ぶので弱みは挙がらない → 強みの締めは落差を使えない
    chart = _chart("x", {"a": 3.0, "b": 0.0, "c": 0.0, "d": 0.0}, ["a", "b", "c", "d"], 3.0)
    assert keys(chart.strength_note)[4] == "high.counter_flat"
    assert chart.weakness_note == []

    chart = _chart("x", {"a": 3.0, "b": 1.0, "c": 0.0, "d": 0.0}, ["a", "b", "c", "d"], 3.0)
    counter = chart.strength_note[4]
    assert counter.key == "high.counter"
    assert counter.codes == ["c", "d"]  # 同点の谷は両方挙げる
    assert counter.params == {"value": 0.0, "gap": 3.0}


def test_note_is_empty_without_a_focus_axis():
    """解説する軸が無ければ、他が揃っていても組み立てない。"""
    assert build_note("x", axes({"a": 1.0, "b": 2.0}), [], ["b"], 2.0, high=True) == []


def test_every_chart_declares_a_tier():
    """区分の無いチャートがあると、ペイウォールの判定から漏れる。"""
    for chart in build_charts(PILLARS, DAY_MASTER, True):
        assert chart.note_tier in {FREE, PAID}, chart.key


def test_five_elements_note_stays_free():
    """無料側にも解説を1枚残す。全部隠すと結果が数字の羅列になる。"""
    charts = {c.key: c for c in build_charts(PILLARS, DAY_MASTER, True)}
    assert charts["five_elements"].note_tier == FREE


def test_the_rest_of_the_notes_are_paid():
    paid = [c.key for c in build_charts(PILLARS, DAY_MASTER, True) if c.note_tier == PAID]
    assert len(paid) == 9


def test_preview_stops_before_the_strongest_sentence():
    """予告に「あなたにとって何を意味するか」を含めない。

    そこを渡してしまうと続きを読む理由が消える。上限より手前でも必ず切る。
    """
    chart = next(c for c in build_charts(PILLARS, DAY_MASTER, True) if c.strength_note)
    order = [s.key for s in chart.strength_note]
    hint = next(i for i, key in enumerate(order) if key.startswith("hint."))
    assert preview_length(order, limit=99) == hint


def test_preview_respects_the_limit():
    """引きが弱い文が続いても、上限を超えて出さない。"""
    order = ["high.lead", "high.spread", "high.band.clear"]
    assert preview_length(order, limit=2) == 2


def test_preview_can_be_closed_entirely():
    assert preview_length(["high.lead"], limit=0) == 0


def test_hook_strength_reads_every_sentence_kind():
    """種類を取り違えると、切る位置が黙ってずれる。"""
    assert hook_strength("high.lead") == 1
    assert hook_strength("low.band.absent") == 2
    assert hook_strength("high.counter_flat") == 2
    assert hook_strength("hint.five_elements.strength") == 3
