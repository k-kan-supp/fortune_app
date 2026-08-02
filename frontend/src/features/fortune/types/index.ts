/** 四柱推命ドメインの型（バックエンドの schemas と対応させる）。 */

export interface FortuneRequest {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  is_male: boolean;
}

export interface Pillar {
  stem: string;
  branch: string;
  element: string;
  ten_god: string | null;
  hidden_stems: string[];
}

/** レーダーチャートの一軸。code は表示名の引き当てに使う安定したキー。 */
export interface RadarAxis {
  code: string;
  value: number;
}

/**
 * 解説文の一文分。文言はバックエンドが持たないので、key で訳を引き、
 * codes を訳した軸名（{{axis}}）と params の数値を差し込んで組み立てる。
 */
export interface NarrativeSegment {
  key: string;
  codes: string[];
  params: Record<string, number>;
}

/** レーダーチャート1枚分。値の意味はチャートごとに違うので外周値を持ち回る。 */
export interface RadarChart {
  key: string;
  max_value: number;
  axes: RadarAxis[];
  /** 際立って高い軸のコード。並びが平坦なチャートでは空。 */
  strengths: string[];
  /** 際立って低い軸のコード。並びが平坦なチャートでは空。 */
  weaknesses: string[];
  /** 強みの解説文。strengths が空なら空。 */
  strength_note: NarrativeSegment[];
  /** 弱みの解説文。weaknesses が空なら空。 */
  weakness_note: NarrativeSegment[];
}

/** 命式の種族。日主の五行 × 最も強い通変星グループで 25 通り。 */
export interface Species {
  /** 2文字のコード。名前と説明はこれを使って i18n から引く。 */
  code: string;
  element: string;
  group: string;
  /** そのグループが全体に占める割合（%）。 */
  group_share: number;
}

/** 人体星図の十大主星（5か所）。 */
export interface SanmeiStar {
  /** head / chest / belly / left_hand / right_hand */
  position: string;
  star: string;
  /** 導出元（year_stem / month_hidden など）。根拠の表示に使う。 */
  source: string;
}

/** 人体星図の十二大従星（3か所）。 */
export interface SanmeiFollower {
  /** early / middle / late */
  period: string;
  star: string;
  energy: number;
  branch: string;
}

/** 算命学の陽占（人体星図）。 */
export interface Sanmei {
  stars: SanmeiStar[];
  followers: SanmeiFollower[];
  center: string;
  energy_total: number;
}

/** 25 種族どうしの相性マップ。codes 順の 25×25。 */
export interface SpeciesCompat {
  codes: string[];
  matrix: number[][];
  /** 五行の頭文字2つ（"MW" ＝ 金から見た木）→ 関係コード。判定はバックエンド。 */
  element_relations: Record<string, string>;
  band_low: number;
  band_high: number;
  mean: number;
}

export interface FortuneResponse {
  year_pillar: Pillar;
  month_pillar: Pillar;
  day_pillar: Pillar;
  hour_pillar: Pillar;
  day_master: string;
  /** 古い API は返さないので任意扱い。 */
  species?: Species;
  sanmei?: Sanmei;
  /** 古い API は返さないので任意扱い（バックエンドの既定値は空配列）。 */
  charts?: RadarChart[];
}
