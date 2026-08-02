"""関係別の種族相性。

表は ``scratchpad/gen_relations.py`` が相性エンジンを総当たりして作った測定値。
ここでは形と、いくつかのセルを同じ手順で測り直して照合する。
面の配点や関係の重みを変えて表を測り直し忘れると、この照合が落ちる。
"""

import collections
import datetime

import pytest

from app.schemas.fortune import FortuneRequest, Pillar
from app.services.saju.compatibility import compatibility
from app.services.saju.pillars import four_pillars
from app.services.saju.population import JAPAN_POPULATION
from app.services.saju.relations import (
    RELATION_THRESHOLDS,
    RELATION_WEIGHTS,
    RELATIONS,
    SUITED_PCT,
    relation_ranking,
    relation_rankings,
    suited_share,
)
from app.services.saju.species import species
from app.services.saju.species_compat import CODES, scaled_matrix

# 生成スクリプトと同じ抽出条件。変えるなら両方そろえること。
DATE_SPAN = (datetime.date(1950, 1, 1), datetime.date(2009, 12, 31))
K = 64


@pytest.fixture(scope="module")
def reps() -> dict[str, list[dict[str, Pillar]]]:
    """種族ごとの代表命式。

    出生時刻は2時間ずつ巡回させる。正午に固定すると代表がそろって同じ時支を
    持ってしまい、測っているものが変わる。
    """
    by: dict[str, list[dict[str, Pillar]]] = collections.defaultdict(list)
    day, last = DATE_SPAN
    index = 0
    while day <= last:
        pillars, day_master = four_pillars(
            FortuneRequest(
                year=day.year, month=day.month, day=day.day, hour=(index % 12) * 2 + 1
            )
        )
        by[species(pillars, day_master).code].append(pillars)
        day += datetime.timedelta(days=1)
        index += 1
    return {c: by[c][:: max(1, len(by[c]) // K)][:K] for c in CODES}


def test_weights_sum_to_one_per_relation():
    for relation, weights in RELATION_WEIGHTS.items():
        assert sum(weights.values()) == pytest.approx(1.0), relation


def test_every_relation_has_a_full_matrix():
    for relation in RELATIONS:
        table = SUITED_PCT[relation]
        assert len(table) == len(CODES), relation
        assert all(len(row) == len(CODES) for row in table), relation


def test_matrices_are_symmetric():
    """相性は向きを持たない。片側だけ書き換わっていたら測り直しの取りこぼし。"""
    for relation in RELATIONS:
        table = SUITED_PCT[relation]
        for i in range(len(CODES)):
            for j in range(len(CODES)):
                assert table[i][j] == table[j][i], (relation, CODES[i], CODES[j])


def test_relations_disagree_with_each_other():
    """関係ごとに違う答えが出ること。

    全部同じなら総合点ひとつで足りていて、この表を持つ意味が無い。
    """
    lover = SUITED_PCT["lover"]
    business = SUITED_PCT["business"]
    gaps = [abs(lover[i][j] - business[i][j]) for i in range(25) for j in range(25)]
    assert max(gaps) > 40


@pytest.mark.parametrize(
    ("mine", "theirs", "relation"),
    [
        ("WS", "FS", "lover"),
        ("WS", "ES", "colleague"),
        ("ES", "AO", "business"),
        ("MS", "AL", "spouse"),
    ],
)
def test_cells_match_a_fresh_measurement(reps, mine, theirs, relation):
    """表のセルを、同じ手順で測り直して突き合わせる。"""
    weights = RELATION_WEIGHTS[relation]
    threshold = RELATION_THRESHOLDS[relation]

    hits = 0
    total = 0
    for a in reps[mine]:
        for b in reps[theirs]:
            _, facets, _ = compatibility(a, b)
            score = sum(facets[facet] * weight for facet, weight in weights.items())
            hits += score >= threshold
            total += 1

    measured = round(hits / total * 100)
    assert measured == SUITED_PCT[relation][CODES.index(mine)][CODES.index(theirs)]


def test_each_relation_is_ranked_on_its_own_score():
    """関係ごとに、その関係の点で並ぶこと。総合点の並びを流用しない。"""
    for mine in CODES:
        for relation in RELATIONS:
            rows = relation_ranking(mine, relation)
            shares = [row.share for row in rows]
            assert shares == sorted(shares, reverse=True), (mine, relation)


def test_ranking_draws_from_all_twenty_five_species():
    """総合点で先に絞らない。

    先に 10 種族へ絞ると、その関係で上位のはずの種族が候補から落ちる。
    実際に落ちる組があることを、ここで固定しておく。
    """
    overall = scaled_matrix()[CODES.index("WX")]
    top_ten = {c for c, _ in sorted(zip(CODES, overall, strict=True), key=lambda p: -p[1])[:10]}
    business = {row.code for row in relation_ranking("WX", "business")}
    assert business - top_ten, "総合点の上位10に無い種族が business の上位に入るはず"


def test_relations_pick_different_partners():
    """関係ごとに顔ぶれが変わること。全部同じなら、タブに分ける意味が無い。"""
    firsts = {
        relation: relation_ranking("WX", relation)[0].code for relation in RELATIONS
    }
    assert len(set(firsts.values())) > 1, firsts


def test_ties_fall_to_the_larger_species():
    """同率なら人数の多い順。並びが実行ごとに揺れないようにする。"""
    for mine in CODES:
        for relation in RELATIONS:
            rows = relation_ranking(mine, relation)
            for a, b in zip(rows, rows[1:], strict=False):
                if a.share == b.share:
                    assert a.people >= b.people, (mine, relation, a.code, b.code)


def test_rankings_cover_every_relation_in_order():
    rankings = relation_rankings("MS", 10)
    assert [r.relation for r in rankings] == list(RELATIONS)
    assert all(len(r.rows) == 10 for r in rankings)


def test_suited_never_exceeds_the_species_population():
    """向いている人数が、その種族の総数を超えない。"""
    for mine in CODES:
        for ranking in relation_rankings(mine):
            for row in ranking.rows:
                assert 0 < row.people < JAPAN_POPULATION
                assert 0 <= row.suited <= row.people
                assert 0 <= row.share <= 100


def test_unknown_species_yields_nothing():
    assert relation_ranking("??", "lover") == []
    assert all(r.rows == [] for r in relation_rankings("??"))
    assert suited_share("??", "WS", "lover") == 0.0
    assert suited_share("WS", "WS", "friendship") == 0.0
