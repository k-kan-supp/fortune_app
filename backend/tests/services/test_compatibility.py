import pytest

from app.schemas.fortune import FortuneRequest, Pillar
from app.services.saju.compatibility import FACET_WEIGHTS, TOTAL_RANGE, compatibility
from app.services.saju.constants import BRANCH_HIDDEN_STEMS, EARTHLY_BRANCHES, STEM_ELEMENT
from app.services.saju.pillars import four_pillars

FACETS = {"body", "heart", "mind", "support"}


def _pillar(stem: str, branch: str) -> Pillar:
    return Pillar(
        stem=stem,
        branch=branch,
        element=STEM_ELEMENT[stem],
        hidden_stems=BRANCH_HIDDEN_STEMS[branch],
    )


def _chart(day_stem: str, day_branch: str) -> dict[str, Pillar]:
    """日柱だけを指定した命式。他の柱は両者で共通にして比較を単純にする。"""
    return {
        "year": _pillar("甲", "子"),
        "month": _pillar("丙", "寅"),
        "day": _pillar(day_stem, day_branch),
        "hour": _pillar("戊", "辰"),
    }


def test_facets_are_the_four_plain_language_ones():
    _, facets, notes = compatibility(_chart("甲", "午"), _chart("丙", "午"))
    assert set(facets) == FACETS
    assert set(FACET_WEIGHTS) == FACETS
    assert sum(FACET_WEIGHTS.values()) == pytest.approx(1.0)
    assert len(notes) == len(facets)


def test_generating_day_masters_warm_the_heart_more_than_controlling():
    # 甲(木) は 丙(火) を生む / 甲(木) は 戊(土) を剋す
    generates, facets_gen, notes_gen = compatibility(_chart("甲", "午"), _chart("丙", "午"))
    controls, facets_con, _ = compatibility(_chart("甲", "午"), _chart("戊", "午"))

    assert facets_gen["heart"] > facets_con["heart"]
    assert generates > controls
    assert "day_master.generates" in notes_gen


def test_six_harmony_branches_beat_a_clash_on_the_body():
    # 子丑は六合 / 子午は冲
    harmony, harmony_facets, harmony_notes = compatibility(_chart("甲", "子"), _chart("甲", "丑"))
    clash, clash_facets, clash_notes = compatibility(_chart("甲", "子"), _chart("甲", "午"))

    assert harmony_facets["body"] > clash_facets["body"]
    assert harmony > clash
    assert "branch.six_harmony" in harmony_notes
    assert "branch.clash" in clash_notes


def test_three_harmony_is_recognised():
    # 申子辰は三合（水局）
    _, _, notes = compatibility(_chart("甲", "申"), _chart("甲", "辰"))
    assert "branch.three_harmony" in notes


def test_same_branch_is_not_treated_as_three_harmony():
    # 十二支はすべていずれかの三合に属するので、同支の判定を三合より後ろに
    # 置くと「子と子」が三合として拾われてしまう。
    for branch in EARTHLY_BRANCHES:
        _, _, notes = compatibility(_chart("甲", branch), _chart("甲", branch))
        assert "branch.same" in notes, branch


def test_identical_charts_think_alike_but_do_not_complement():
    # 同じ命式なら考え方は完全に一致し、五行の偏りは埋め合えない
    chart = _chart("庚", "酉")
    _, facets, notes = compatibility(chart, chart)

    assert facets["mind"] == 100.0
    assert facets["support"] == 0.0
    assert "mind.alike" in notes
    assert "element.similar" in notes


def test_score_is_symmetric_and_bounded():
    a, b = _chart("庚", "酉"), _chart("乙", "卯")
    forward, facets, _ = compatibility(a, b)
    backward, _, _ = compatibility(b, a)

    assert forward == backward  # 見る向きで相性は変わらない
    assert 0.0 <= forward <= 100.0
    assert all(0.0 <= value <= 100.0 for value in facets.values())


def test_total_follows_the_weighted_mean_after_rescaling():
    # 総合は加重平均をそのまま返すのではなく、実測の範囲で 0〜100 に伸ばした値。
    total, facets, _ = compatibility(_chart("壬", "寅"), _chart("癸", "亥"))
    weighted = sum(facets[code] * weight for code, weight in FACET_WEIGHTS.items())
    low, high = TOTAL_RANGE
    assert total == pytest.approx((weighted - low) / (high - low) * 100, abs=0.05)


def test_facets_and_total_reach_both_ends_of_the_scale():
    """目盛り合わせが効いていて、実在の生年月日で 0 と 100 の両端に届くこと。

    片端しか出ないと「誰と組んでも70点台」に戻ってしまうので、範囲そのものを
    テストで守る。ここが落ちたら FACET_RANGE / TOTAL_RANGE を測り直す。
    """
    charts = [
        four_pillars(
            FortuneRequest(year=1950 + n % 60, month=(n * 7) % 12 + 1, day=(n * 11) % 28 + 1)
        )[0]
        for n in range(90)
    ]

    seen: dict[str, list[float]] = {name: [] for name in (*FACETS, "total")}
    for i, a in enumerate(charts):
        for b in charts[i + 1 :]:
            total, facets, _ = compatibility(a, b)
            seen["total"].append(total)
            for code, value in facets.items():
                seen[code].append(value)

    for name, values in seen.items():
        assert min(values) < 15, f"{name} の下限が高すぎる: {min(values)}"
        assert max(values) > 85, f"{name} の上限が低すぎる: {max(values)}"
        assert all(0.0 <= v <= 100.0 for v in values), name


def test_notes_name_the_facet_they_explain():
    _, _, notes = compatibility(_chart("壬", "寅"), _chart("癸", "亥"))
    assert {note.split(".")[0] for note in notes} == {
        "branch",  # 体
        "day_master",  # 心
        "mind",  # 思考
        "element",  # 支え合い
    }
