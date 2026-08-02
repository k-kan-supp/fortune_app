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


class Species(BaseModel):
    """命式の「種族」。日主の五行 × 最も強い通変星グループの 25 通り。"""

    code: str = Field(..., description="2文字のコード（五行1文字＋主星グループ1文字）")
    element: str = Field(..., description="日主の五行")
    group: str = Field(..., description="最も強い通変星グループ")
    group_share: float = Field(..., description="そのグループが全体に占める割合（%）")


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
    matrix: list[list[float]] = Field(..., description="codes 順の 25×25。総合点の平均")
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


class FortuneResponse(BaseModel):
    """鑑定結果（命式）。"""

    year_pillar: Pillar
    month_pillar: Pillar
    day_pillar: Pillar
    hour_pillar: Pillar
    day_master: str = Field(..., description="日主（日柱の天干）")
    species: Species | None = Field(None, description="25 種族の判定")
    sanmei: Sanmei | None = Field(None, description="算命学の陽占（人体星図）")
    charts: list[RadarChart] = Field(
        default_factory=list, description="バランス指標（レーダーチャート用）"
    )
