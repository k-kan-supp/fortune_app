from app.schemas.fortune import Pillar
from app.services.saju.compatibility import compatibility
from app.services.saju.constants import BRANCH_HIDDEN_STEMS, EARTHLY_BRANCHES, STEM_ELEMENT


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


def test_generating_day_masters_score_higher_than_controlling():
    # 甲(木) は 丙(火) を生む / 甲(木) は 戊(土) を剋す
    generates, facets_gen, notes_gen = compatibility(_chart("甲", "午"), _chart("丙", "午"))
    controls, facets_con, _ = compatibility(_chart("甲", "午"), _chart("戊", "午"))

    assert facets_gen["day_master"] > facets_con["day_master"]
    assert generates > controls
    assert "day_master.generates" in notes_gen


def test_six_harmony_branches_beat_a_clash():
    # 子丑は六合 / 子午は冲
    harmony, harmony_facets, harmony_notes = compatibility(_chart("甲", "子"), _chart("甲", "丑"))
    clash, clash_facets, clash_notes = compatibility(_chart("甲", "子"), _chart("甲", "午"))

    assert harmony_facets["branch"] > clash_facets["branch"]
    assert harmony > clash
    assert "branch.six_harmony" in harmony_notes
    assert "branch.clash" in clash_notes


def test_three_harmony_is_recognised():
    # 申子辰は三合（水局）
    _, facets, notes = compatibility(_chart("甲", "申"), _chart("甲", "辰"))
    assert "branch.three_harmony" in notes
    assert facets["branch"] == 90.0


def test_same_branch_is_not_treated_as_three_harmony():
    # 十二支はすべていずれかの三合に属するので、同支の判定を三合より後ろに
    # 置くと「子と子」が三合として拾われてしまう。
    for branch in EARTHLY_BRANCHES:
        _, facets, notes = compatibility(_chart("甲", branch), _chart("甲", branch))
        assert "branch.same" in notes, branch
        assert facets["branch"] == 75.0, branch


def test_score_is_symmetric_and_bounded():
    a, b = _chart("庚", "酉"), _chart("乙", "卯")
    forward, facets, _ = compatibility(a, b)
    backward, _, _ = compatibility(b, a)

    assert forward == backward  # 見る向きで相性は変わらない
    assert 0.0 <= forward <= 100.0
    assert set(facets) == {"day_master", "branch", "element"}
    assert all(0.0 <= value <= 100.0 for value in facets.values())


def test_notes_cover_every_facet():
    _, facets, notes = compatibility(_chart("壬", "寅"), _chart("癸", "亥"))
    assert len(notes) == len(facets)
    assert {note.split(".")[0] for note in notes} == {"day_master", "branch", "element"}
