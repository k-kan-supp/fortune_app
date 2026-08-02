"""日本の人口統計と種族分布から、相性の良い人数を概算する。

## 母数

出典: 総務省統計局「人口推計」2025年（令和7年）12月1日現在（概算値）
      総人口 1億2316万人
      https://www.stat.go.jp/data/jinsui/pdf/202512.pdf

年齢では絞らない。絞るには年齢階級別の内訳が要るが、ここで出したいのは
「桁の感覚」であって精度ではない。母数を明示して、読む側が割り引けるようにする。

## 種族の分布

**1/25 ではない。** 日主の五行と通変星グループの出方は暦の構造に縛られていて、
実際に数えると最多（ES 13.1%）と最少（EL 1.0%）で13倍の開きがある。
均等と仮定すると、種族によって答えが数倍ずれる。

数え方は、生年月日を1930〜2010年の全日について回し、そのつど命式を組んで種族を
求めたもの。**出生時刻は2時間ずつ巡回させている** ── 正午に固定すると時柱が偏り、
AG が 2.3% から 6.7% に化けるなど分布が別物になる。実際の出生は一日中あるので、
時刻を散らしたほうが実態に近い。

表は凍らせてある（毎回数えると 0.5 秒かかる）。占術ロジックを変えたら値も動くので、
テストが同じ手順で数え直して突き合わせる。ずれたらテストが落ちる。
"""

from typing import Final

from app.services.saju.species_compat import BANDS, CODES, scaled_matrix

# 総務省統計局「人口推計」2025年12月1日現在（概算値）
JAPAN_POPULATION: Final = 123_160_000
POPULATION_AS_OF: Final = "2025-12-01"

# 分布を数えた生年の範囲。存命の人口がおおむね収まる幅。
SAMPLE_BIRTH_YEARS: Final = (1930, 2010)

# 25 種族の構成比（合計 1）。上のとおり実際に数えた値で、均等ではない。
SPECIES_SHARE: Final[dict[str, float]] = {
    "WS": 0.07561,
    "WX": 0.02309,
    "WG": 0.05868,
    "WO": 0.02140,
    "WL": 0.02126,
    "FS": 0.06841,
    "FX": 0.06243,
    "FG": 0.02434,
    "FO": 0.02268,
    "FL": 0.02211,
    "ES": 0.13091,
    "EX": 0.01812,
    "EG": 0.01991,
    "EO": 0.02129,
    "EL": 0.00973,
    "MS": 0.07108,
    "MX": 0.02373,
    "MG": 0.02326,
    "MO": 0.02258,
    "ML": 0.05935,
    "AS": 0.07781,
    "AX": 0.02454,
    "AG": 0.02292,
    "AO": 0.05019,
    "AL": 0.02457,
}


def matching_species(mine: str) -> list[str]:
    """自分から見て相性が高い帯に入る種族コード。

    境目は既存の帯（``BANDS`` の上側＝上位1/3）をそのまま使う。ここで別の
    基準を作ると、相性マップの色分けと「相性が良い」の意味が食い違う。
    """
    if mine not in CODES:
        return []
    row = scaled_matrix()[CODES.index(mine)]
    _, high = BANDS
    return [code for code, value in zip(CODES, row, strict=True) if value >= high]


def compatible_people(mine: str) -> tuple[int, float, list[str]]:
    """相性が良い人の概算人数・人口比（％）・対象の種族を返す。

    人数は分布の合計に人口を掛けるだけ。種族ごとの構成比が均等でないので、
    「何種族と相性が良いか」と「何人いるか」は比例しない。
    """
    codes = matching_species(mine)
    share = sum(SPECIES_SHARE.get(code, 0.0) for code in codes)
    return round(JAPAN_POPULATION * share), round(share * 100, 1), codes
