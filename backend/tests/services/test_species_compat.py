"""25 種族の相性マップ。

表は ``scratchpad/gen_species_compat.py`` が相性エンジンを総当たりして作った
測定値なので、ここでは形と、いくつかのセルを同じ手順で測り直して照合する。
配点を変えて表を測り直し忘れると、この照合が落ちる。
"""

import collections
import datetime
import statistics

import pytest

from app.schemas.fortune import FortuneRequest, Pillar
from app.services.saju.compatibility import compatibility
from app.services.saju.pillars import four_pillars
from app.services.saju.species import species
from app.services.saju.species_compat import CODES, MATRIX, row, score

# 生成スクリプトと同じ抽出条件。変えるなら両方そろえること。
SPAN = (datetime.date(1950, 1, 1), datetime.date(2009, 12, 31))
K = 64


@pytest.fixture(scope="module")
def reps() -> dict[str, list[dict[str, Pillar]]]:
    """種族ごとの代表命式。生成スクリプトと同じ並び・同じ間引き方で作る。"""
    by: dict[str, list[dict[str, Pillar]]] = collections.defaultdict(list)
    day, last = SPAN
    while day <= last:
        pillars, day_master = four_pillars(
            FortuneRequest(year=day.year, month=day.month, day=day.day, hour=12, minute=0)
        )
        by[species(pillars, day_master).code].append(pillars)
        day += datetime.timedelta(days=1)
    return {c: by[c][:: max(1, len(by[c]) // K)][:K] for c in CODES}


def test_matrix_is_twenty_five_squared():
    assert len(CODES) == 25
    assert len(MATRIX) == 25
    assert all(len(r) == 25 for r in MATRIX)


def test_matrix_is_symmetric():
    """相性に向きは無いので、表は対角線で折り返せる。"""
    for i in range(25):
        for j in range(25):
            assert MATRIX[i][j] == MATRIX[j][i], (CODES[i], CODES[j])


def test_scores_stay_on_the_hundred_point_scale():
    flat = [v for r in MATRIX for v in r]
    assert all(0 <= v <= 100 for v in flat)
    # 全部同じ値なら表として意味がない
    assert max(flat) - min(flat) > 20


def test_row_returns_all_twenty_five_partners():
    r = row("MS")
    assert set(r) == set(CODES)
    assert r["EO"] == score("MS", "EO")


@pytest.mark.parametrize("pair", [("MS", "EO"), ("WS", "WO"), ("AL", "FG")])
def test_cells_match_the_engine_when_measured_again(reps, pair):
    """表の値を、同じ抽出条件で相性エンジンから測り直して照合する。"""
    a, b = pair
    measured = statistics.fmean(compatibility(x, y)[0] for x in reps[a] for y in reps[b])
    # 平均の標準誤差は測定時で最大 0.17 点。丸めの幅も見て 0.3 点を許容幅にする。
    assert abs(measured - score(a, b)) < 0.3, (pair, measured, score(a, b))
