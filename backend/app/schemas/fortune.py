from pydantic import BaseModel, Field


class FortuneRequest(BaseModel):
    """鑑定リクエスト（入力の契約）。"""

    year: int = Field(..., ge=1900, le=2100, description="西暦の生まれ年")
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    hour: int = Field(12, ge=0, le=23, description="生まれた時刻（時）")
    minute: int = Field(0, ge=0, le=59)
    is_male: bool = Field(True, description="性別（大運の順逆に使用）")


class Pillar(BaseModel):
    """一柱（天干＋地支）。"""

    stem: str = Field(..., description="天干（十干）")
    branch: str = Field(..., description="地支（十二支）")
    element: str = Field(..., description="天干の五行")
    ten_god: str | None = Field(None, description="日主から見た十神")
    hidden_stems: list[str] = Field(default_factory=list, description="蔵干")


class RadarAxis(BaseModel):
    """レーダーチャートの一軸。"""

    code: str = Field(..., description="軸のコード（甲・木・career など。表示名はフロントで解決）")
    value: float = Field(..., description="この軸の値（0〜max_value）")


class NarrativeSegment(BaseModel):
    """解説文の一文分。文言は持たず、フロントが訳して差し込むための材料だけを返す。"""

    key: str = Field(..., description="文言のキー（フロントの fortune.narrative 以下）")
    codes: list[str] = Field(
        default_factory=list, description="{{axis}} に入れる軸コード。訳と連結はフロント側"
    )
    params: dict[str, float] = Field(
        default_factory=dict, description="{{value}} などに差し込む数値"
    )


class RadarChart(BaseModel):
    """レーダーチャート1枚分のデータ。"""

    key: str = Field(..., description="チャート種別（five_elements など）")
    max_value: float = Field(..., description="外周にあたる値。軸の値はこれを上限に描く")
    axes: list[RadarAxis]
    strengths: list[str] = Field(
        default_factory=list, description="際立って高い軸のコード。無ければ空"
    )
    weaknesses: list[str] = Field(
        default_factory=list, description="際立って低い軸のコード。無ければ空"
    )
    strength_note: list[NarrativeSegment] = Field(
        default_factory=list, description="強みの解説文（一文ずつ）。strengths が空なら空"
    )
    weakness_note: list[NarrativeSegment] = Field(
        default_factory=list, description="弱みの解説文（一文ずつ）。weaknesses が空なら空"
    )
    note_tier: str = Field(default="free", description="解説文の区分（free / paid）")
    note_locked: bool = Field(
        default=False,
        description=(
            "有料の解説文がまだ開放されていない。true のとき note は空で返るが、"
            "強み・弱みの軸コードは残す（何が隠れているか分からないと課金動機にならない）"
        ),
    )
    note_hidden: int = Field(
        default=0, description="伏せた文の数。読者に「あと何文あるか」を示すために返す"
    )


class Species(BaseModel):
    """命式の「種族」。日主の五行 × 最も強い通変星グループの 25 通り。"""

    code: str = Field(..., description="2文字のコード（五行1文字＋主星グループ1文字）")
    element: str = Field(..., description="日主の五行")
    group: str = Field(..., description="最も強い通変星グループ")
    group_share: float = Field(..., description="そのグループが全体に占める割合（%）")


class SpeciesReach(BaseModel):
    """ある関係における、相性の高い種族ひとつ分。"""

    code: str = Field(..., description="種族コード")
    people: int = Field(..., description="その種族の概算人数")
    suited: int = Field(..., description="この関係で向いている概算人数")
    share: float = Field(..., description="その種族のうち向いている割合（％）")


class RelationRanking(BaseModel):
    """関係ひとつぶんの順位表。

    関係ごとに全 25 種族から選び直す。総合点で先に 10 種族に絞ると、その関係で
    上位のはずの種族が候補から落ちてしまう（実際に落ちる例がある）。
    """

    relation: str = Field(..., description="lover / colleague / business / spouse")
    rows: list[SpeciesReach] = Field(default_factory=list, description="相性が高い順")


class CompatiblePopulation(BaseModel):
    """相性の良い人が日本にどれくらいいるかの概算。

    文言は持たない。母数・時点・割合だけを返し、注記の書き方はフロントに任せる。
    """

    people: int = Field(..., description="概算人数")
    share: float = Field(..., description="人口に占める割合（％）")
    one_in: float = Field(..., description="およそ何人に1人か")
    basis: int = Field(..., description="母数に使った総人口")
    as_of: str = Field(..., description="人口統計の時点（YYYY-MM-DD）")
    species_codes: list[str] = Field(
        default_factory=list, description="相性が高い帯に入る種族コード"
    )
    rankings: list[RelationRanking] = Field(
        default_factory=list,
        description="関係ごとの順位表（lover / colleague / business / spouse の順）",
    )


class SanmeiStar(BaseModel):
    """人体星図の十大主星（5か所）。"""

    position: str = Field(..., description="head / chest / belly / left_hand / right_hand")
    star: str = Field(..., description="十大主星（貫索星 など）")
    source: str = Field(..., description="導出元（year_stem / month_hidden など）")


class SanmeiFollower(BaseModel):
    """人体星図の十二大従星（3か所）。"""

    period: str = Field(..., description="early / middle / late")
    star: str = Field(..., description="十二大従星（天将星 など）")
    energy: int = Field(..., description="エネルギー点（1〜12）")
    branch: str = Field(..., description="導出元の地支")


class Sanmei(BaseModel):
    """算命学の陽占（人体星図）。"""

    stars: list[SanmeiStar]
    followers: list[SanmeiFollower]
    center: str = Field(..., description="中心星（胸の主星）")
    energy_total: int = Field(..., description="三大従星のエネルギー合計（3〜36）")


class SpeciesCompatMap(BaseModel):
    """25 種族どうしの相性マップ。命式によらず一定なので、鑑定結果とは別に配る。"""

    codes: list[str] = Field(..., description="行・列に共通の種族コードの並び")
    matrix: list[list[float]] = Field(
        ...,
        description="codes 順の 25×25。行ごとに 0〜100 へ伸ばしてあるため対称ではない",
    )
    row_means: list[float] = Field(
        ..., description="行ごとの平均。暖色・寒色を分ける境目（本人の行の平均）"
    )
    element_relations: dict[str, str] = Field(
        ...,
        description=(
            "五行の頭文字2つ（MW＝金から見た木）→ "
            "same / generates / generated / controls / controlled"
        ),
    )
    band_low: float = Field(..., description="これ以下なら「低いほう」")
    band_high: float = Field(..., description="これ以上なら「高いほう」")
    mean: float = Field(..., description="表全体の平均。組の位置づけを言う基準")


class WeatherReading(BaseModel):
    """その日の観測値。占術に使う前の素のデータ。"""

    date: str = Field(..., description="現地日付（YYYY-MM-DD）")
    temperature_c: float
    humidity_pct: float
    weather_code: int = Field(..., description="WMO の天気コード")
    sunrise: str
    sunset: str
    daylight_hours: float = Field(..., description="日の出から日の入りまでの時間")
    latitude: float
    longitude: float


class DailyFortuneRequest(FortuneRequest):
    """日運のリクエスト。地点を省くと東京で引く。"""

    latitude: float | None = Field(None, ge=-90, le=90)
    longitude: float | None = Field(None, ge=-180, le=180)


class DailyArea(BaseModel):
    """日運の分野ひとつ。"""

    code: str = Field(..., description="health / wealth / career / love")
    stars: int = Field(..., ge=0, le=5, description="星の数")
    score: float = Field(..., description="0〜100。本人が取りうる幅の中での位置")


class DailyPoint(BaseModel):
    """今日のいいところ／悪いところ。"""

    area: str = Field(..., description="対象の分野")
    driver_kind: str = Field(..., description="group（通変星グループ）/ element（五行）")
    driver: str = Field(..., description="その分野を動かしているコード")


class DailyFortune(BaseModel):
    """その日の運勢。気象を五行に置き換え、命式と重ねて分野ごとに出す。"""

    reading: WeatherReading
    sky: str = Field(..., description="clear / cloudy / fog / rain / snow / storm")
    elements: list[RadarAxis] = Field(..., description="今日の空気の五行構成比（%）")
    species: str = Field(..., description="種族コード。出方はこれで変わる")
    areas: list[DailyArea] = Field(..., description="健康・金・仕事・恋愛の4分野")
    good: DailyPoint = Field(..., description="今日いちばん伸びる分野")
    bad: DailyPoint = Field(..., description="今日いちばん動きにくい分野")
    fills: list[str] = Field(default_factory=list, description="今日補われる五行")
    floods: list[str] = Field(default_factory=list, description="今日さらに増える五行")


class FortuneResponse(BaseModel):
    """鑑定結果（命式）。"""

    year_pillar: Pillar
    month_pillar: Pillar
    day_pillar: Pillar
    hour_pillar: Pillar
    day_master: str = Field(..., description="日主（日柱の天干）")
    species: Species | None = Field(None, description="25 種族の判定")
    compatible: CompatiblePopulation | None = Field(
        None, description="相性の良い人が日本におよそ何人いるかの概算"
    )
    sanmei: Sanmei | None = Field(None, description="算命学の陽占（人体星図）")
    charts: list[RadarChart] = Field(
        default_factory=list, description="バランス指標（レーダーチャート用）"
    )
