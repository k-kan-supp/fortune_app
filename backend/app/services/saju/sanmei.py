"""算命学の陽占（人体星図）を組み立てる。

四柱推命と算命学は同じ干支暦を土台にしていて、星の名前が違うだけの層がある。

* 十大主星 ＝ 十神（通変星）の読み替え
* 十二大従星 ＝ 十二運星の読み替え。エネルギー点も ``TWELVE_STAGE_ENERGY``
  （絶1〜帝旺12、合計78）がそのまま算命学の点数表と一致する

そのため計算は既存の ``ten_god`` / ``twelve_stage`` をそのまま使い、ここでは
算命学の名前に置き換えて人体の位置に配るところだけを受け持つ。

位置の取り方（陽占の標準的な出し方）::

    北（頭）  = 年干        目上・父・仕事
    南（腹）  = 月干        目下・子ども・部下
    東（左手）= 年支の蔵干  配偶者・家庭
    中央（胸）= 月支の蔵干  本質（中心星）
    西（右手）= 日支の蔵干  友人・兄弟・社会

    初年 = 年支 / 中年 = 月支 / 晩年 = 日支（いずれも日干から見た十二大従星）

蔵干は本気（``hidden_stems`` の先頭）を採る。算命学は本来、節入りからの
日数で蔵干を選び分けるが、その日数はこの命式データに持っていないため、
本気で代表させている。

文言は返さず、フロントが訳せるよう星の名前と位置コードだけを返す。
"""

from app.schemas.fortune import Pillar, Sanmei, SanmeiFollower, SanmeiStar
from app.services.saju.constants import TWELVE_STAGE_ENERGY
from app.services.saju.ten_gods import ten_god
from app.services.saju.twelve_stages import twelve_stage

# 十神 → 十大主星
MAIN_STAR = {
    "比肩": "貫索星",
    "劫財": "石門星",
    "食神": "鳳閣星",
    "傷官": "調舒星",
    "偏財": "禄存星",
    "正財": "司禄星",
    "偏官": "車騎星",
    "正官": "牽牛星",
    "偏印": "龍高星",
    "印綬": "玉堂星",
}

# 十二運星 → 十二大従星
FOLLOWER_STAR = {
    "胎": "天報星",
    "養": "天印星",
    "長生": "天貴星",
    "沐浴": "天恍星",
    "冠帯": "天南星",
    "建禄": "天禄星",
    "帝旺": "天将星",
    "衰": "天堂星",
    "病": "天胡星",
    "死": "天極星",
    "墓": "天庫星",
    "絶": "天馳星",
}

# 十大主星を出す5か所。(位置コード, 導出元コード)
MAIN_POSITIONS = [
    ("head", "year_stem"),
    ("belly", "month_stem"),
    ("left_hand", "year_hidden"),
    ("chest", "month_hidden"),
    ("right_hand", "day_hidden"),
]

# 十二大従星を出す3か所。(時期コード, 見る柱)
FOLLOWER_POSITIONS = [("early", "year"), ("middle", "month"), ("late", "day")]


def _source_stem(pillars: dict[str, Pillar], source: str) -> str:
    """位置の導出元にあたる天干を取り出す。蔵干は本気を採る。"""
    code, _, kind = source.partition("_")
    pillar = pillars[code]
    if kind == "stem":
        return pillar.stem
    # 蔵干が空の支は無い（BRANCH_HIDDEN_STEMS は全支に1つ以上持つ）
    return pillar.hidden_stems[0]


def sanmei(pillars: dict[str, Pillar], day_master: str) -> Sanmei:
    """命式から人体星図を組み立てる。"""
    stars = [
        SanmeiStar(
            position=position,
            star=MAIN_STAR[ten_god(day_master, _source_stem(pillars, source))],
            source=source,
        )
        for position, source in MAIN_POSITIONS
    ]

    followers = []
    for period, code in FOLLOWER_POSITIONS:
        stage = twelve_stage(day_master, pillars[code].branch)
        followers.append(
            SanmeiFollower(
                period=period,
                star=FOLLOWER_STAR[stage],
                energy=TWELVE_STAGE_ENERGY[stage],
                branch=pillars[code].branch,
            )
        )

    center = next(s.star for s in stars if s.position == "chest")
    return Sanmei(
        stars=stars,
        followers=followers,
        center=center,
        energy_total=sum(f.energy for f in followers),
    )
