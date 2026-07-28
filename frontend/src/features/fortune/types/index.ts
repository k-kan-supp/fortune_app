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

export interface FortuneResponse {
  year_pillar: Pillar;
  month_pillar: Pillar;
  day_pillar: Pillar;
  hour_pillar: Pillar;
  day_master: string;
}
