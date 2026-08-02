"""四柱（年・月・日・時）の算出。

干支と節入りの計算は sxtwl（寿星天文暦）に委譲する。
sxtwl 未インストールでもモジュール自体は import できるよう、遅延 import にしている。

ログは鑑定1回につき1行だけ、この層に置く。``ten_gods`` や ``analysis`` の中は
相性判定から総当たりで何万回も呼ばれるため、ログを入れると出力が溢れる。
生年月日そのものは個人情報なので載せず、導出結果（日主）だけを残す。
"""

import logging

from app.schemas.fortune import (
    CompatiblePopulation,
    FortuneRequest,
    FortuneResponse,
    Pillar,
)
from app.services.saju.analysis import build_charts
from app.services.saju.constants import (
    BRANCH_HIDDEN_STEMS,
    EARTHLY_BRANCHES,
    HEAVENLY_STEMS,
    STEM_ELEMENT,
)
from app.services.saju.population import (
    JAPAN_POPULATION,
    POPULATION_AS_OF,
    compatible_people,
)
from app.services.saju.relations import relation_matrix
from app.services.saju.sanmei import sanmei
from app.services.saju.species import species
from app.services.saju.ten_gods import ten_god

logger = logging.getLogger("app.saju")


def _pillar(stem_idx: int, branch_idx: int, day_master: str | None) -> Pillar:
    stem = HEAVENLY_STEMS[stem_idx]
    branch = EARTHLY_BRANCHES[branch_idx]
    return Pillar(
        stem=stem,
        branch=branch,
        element=STEM_ELEMENT[stem],
        ten_god=ten_god(day_master, stem) if day_master else None,
        hidden_stems=BRANCH_HIDDEN_STEMS[branch],
    )


def four_pillars(req: FortuneRequest) -> tuple[dict[str, Pillar], str]:
    """生年月日時から四柱と日主を求める（チャートは作らない）。"""
    import sxtwl

    day = sxtwl.fromSolar(req.year, req.month, req.day)

    # 時柱の天干は日干から導出する（五鼠遁）。時支は2時間刻み。
    hour_branch_idx = ((req.hour + 1) // 2) % 12
    day_stem_idx = day.getDayGZ().tg
    hour_stem_idx = (day_stem_idx % 5 * 2 + hour_branch_idx) % 10

    year_gz = day.getYearGZ()
    month_gz = day.getMonthGZ()
    day_gz = day.getDayGZ()

    day_master = HEAVENLY_STEMS[day_gz.tg]

    pillars = {
        "year": _pillar(year_gz.tg, year_gz.dz, day_master),
        "month": _pillar(month_gz.tg, month_gz.dz, day_master),
        "day": _pillar(day_gz.tg, day_gz.dz, day_master),
        "hour": _pillar(hour_stem_idx, hour_branch_idx, day_master),
    }

    return pillars, day_master


def calculate_four_pillars(req: FortuneRequest) -> FortuneResponse:
    """生年月日時から命式とバランス指標を組み立てる。"""
    pillars, day_master = four_pillars(req)
    charts = build_charts(pillars, day_master, req.is_male)
    kind = species(pillars, day_master)
    star_chart = sanmei(pillars, day_master)
    people, share, matched = compatible_people(kind.code)
    reach = relation_matrix(kind.code)

    # 生年月日は載せない。日主と種族だけで「計算が通ったか」は追える。
    logger.info(
        "chart calculated",
        extra={"day_master": day_master, "species": kind.code, "charts": len(charts)},
    )

    return FortuneResponse(
        year_pillar=pillars["year"],
        month_pillar=pillars["month"],
        day_pillar=pillars["day"],
        hour_pillar=pillars["hour"],
        day_master=day_master,
        species=kind,
        compatible=CompatiblePopulation(
            people=people,
            share=share,
            # 「4人に1人」のほうが割合より桁を掴みやすい
            one_in=round(100 / share, 1) if share > 0 else 0.0,
            basis=JAPAN_POPULATION,
            as_of=POPULATION_AS_OF,
            species_codes=matched,
            reach=reach,
        ),
        sanmei=star_chart,
        charts=charts,
    )
