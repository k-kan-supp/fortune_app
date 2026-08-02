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

export interface FortuneResponse {
  year_pillar: Pillar;
  month_pillar: Pillar;
  day_pillar: Pillar;
  hour_pillar: Pillar;
  day_master: string;
  /** 古い API は返さないので任意扱い。 */
  species?: Species;
  /** 古い API は返さないので任意扱い（バックエンドの既定値は空配列）。 */
  charts?: RadarChart[];
}
