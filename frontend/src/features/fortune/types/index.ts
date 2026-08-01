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

/** レーダーチャート1枚分。値の意味はチャートごとに違うので外周値を持ち回る。 */
export interface RadarChart {
  key: string;
  max_value: number;
  axes: RadarAxis[];
  /** 際立って高い軸のコード。並びが平坦なチャートでは空。 */
  strengths: string[];
  /** 際立って低い軸のコード。並びが平坦なチャートでは空。 */
  weaknesses: string[];
}

export interface FortuneResponse {
  year_pillar: Pillar;
  month_pillar: Pillar;
  day_pillar: Pillar;
  hour_pillar: Pillar;
  day_master: string;
  /** 古い API は返さないので任意扱い（バックエンドの既定値は空配列）。 */
  charts?: RadarChart[];
}
