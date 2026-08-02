"""相性の良い人数の概算。

母数は公表統計、分布は暦から数えた実測。どちらも「だいたい合っている」ことより
**根拠が追えること**が大事なので、数え直しと突き合わせるところまでを見る。
"""

import datetime

import pytest

from app.schemas.fortune import FortuneRequest
from app.services.saju.pillars import four_pillars
from app.services.saju.population import (
    JAPAN_POPULATION,
    SAMPLE_BIRTH_YEARS,
    SPECIES_SHARE,
    compatible_people,
    matching_species,
)
from app.services.saju.species import species
from app.services.saju.species_compat import BANDS, CODES, scaled_matrix


def test_shares_cover_every_species():
    assert set(SPECIES_SHARE) == set(CODES)


def test_shares_sum_to_one():
    assert sum(SPECIES_SHARE.values()) == pytest.approx(1.0, abs=1e-4)


def test_distribution_is_not_uniform():
    """均等（4%）と仮定すると種族によって数倍ずれる。

    ここが均等に近づいたら、それは占術ロジックが壊れた合図でもある。
    """
    assert max(SPECIES_SHARE.values()) > 10 * min(SPECIES_SHARE.values())


def test_frozen_shares_still_match_a_fresh_count():
    """凍らせた表と、いま数え直した結果が一致すること。

    占術ロジックを変えると分布は動く。表を更新し忘れると、人数だけが古い前提の
    まま画面に出続けるので、ここで落とす。

    出生時刻は2時間ずつ巡回させる。正午に固定すると時柱が偏り、分布が別物になる。
    """
    start, end = SAMPLE_BIRTH_YEARS
    day = datetime.date(start, 1, 1)
    last = datetime.date(end, 12, 31)

    counts: dict[str, int] = {}
    total = 0
    while day <= last:
        pillars, day_master = four_pillars(
            FortuneRequest(year=day.year, month=day.month, day=day.day, hour=(total % 12) * 2 + 1)
        )
        code = species(pillars, day_master).code
        counts[code] = counts.get(code, 0) + 1
        total += 1
        day += datetime.timedelta(days=1)

    for code, frozen in SPECIES_SHARE.items():
        assert counts.get(code, 0) / total == pytest.approx(frozen, abs=5e-5), code


def test_matching_species_uses_the_same_band_as_the_map():
    """「相性が良い」の意味を、相性マップの色分けと食い違わせない。"""
    _, high = BANDS
    for mine in CODES:
        row = scaled_matrix()[CODES.index(mine)]
        expected = {code for code, value in zip(CODES, row, strict=True) if value >= high}
        assert set(matching_species(mine)) == expected, mine


def test_people_follow_the_share_not_the_species_count():
    """種族の数ではなく構成比で人数が決まること。

    構成比が均等でないので、相性の良い種族が多い人が必ずしも人数で勝たない。
    ここが比例していたら、分布を使わずに数えてしまっている。
    """
    results = [(len(codes), people) for people, _, codes in map(compatible_people, CODES)]
    by_count = sorted(results)
    assert [p for _, p in by_count] != sorted(p for _, p in by_count)


def test_people_stay_within_the_population():
    for mine in CODES:
        people, share, _ = compatible_people(mine)
        assert 0 < people < JAPAN_POPULATION
        assert 0 < share < 100


def test_unknown_species_yields_nothing():
    """古い命式や未知のコードで、それらしい数字を出さない。"""
    assert compatible_people("??") == (0, 0.0, [])
