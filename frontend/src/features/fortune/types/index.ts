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
  /** 解説文の区分。命式そのものは常に無料で、有料なのはこの解説だけ。 */
  note_tier: "free" | "paid";
  /** 有料の解説がまだ開放されていない。true のとき note は予告のぶんだけ届く。 */
  note_locked: boolean;
  /** 伏せてある文の数。「あと何文あるか」を出すために使う。 */
  note_hidden: number;
}

/** 相性の高い種族ひとつ分。人数と、関係ごとに向いている人数。 */
export interface SpeciesReach {
  code: string;
  /** その種族の概算人数。 */
  people: number;
  /** 関係コード → 向いている概算人数。同じ種族でも関係で大きく変わる。 */
  suited: Record<string, number>;
}

/** 相性の良い人が日本におよそ何人いるかの概算。 */
export interface CompatiblePopulation {
  /** 概算人数。丸めは表示側で行う（元の値のまま届く）。 */
  people: number;
  /** 人口に占める割合（％）。 */
  share: number;
  /** およそ何人に1人か。 */
  one_in: number;
  /** 母数に使った総人口。 */
  basis: number;
  /** 人口統計の時点（YYYY-MM-DD）。 */
  as_of: string;
  /** 相性が高い帯に入る種族コード。 */
  species_codes: string[];
  /** 相性が高い順の種族と、関係ごとに向いている人数。 */
  reach: SpeciesReach[];
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
  /** 行ごとに 0〜100 へ伸ばしてあるので対称ではない（行＝本人視点）。 */
  matrix: number[][];
  /** 行ごとの平均。暖色・寒色を分ける境目に使う。 */
  row_means: number[];
  /** 五行の頭文字2つ（"MW" ＝ 金から見た木）→ 関係コード。判定はバックエンド。 */
  element_relations: Record<string, string>;
  band_low: number;
  band_high: number;
  mean: number;
}

/** その日の観測値。 */
export interface WeatherReading {
  date: string;
  temperature_c: number;
  humidity_pct: number;
  weather_code: number;
  sunrise: string;
  sunset: string;
  daylight_hours: number;
  latitude: number;
  longitude: number;
}

/** 日運の分野ひとつ。 */
export interface DailyArea {
  /** health / wealth / career / love */
  code: string;
  stars: number;
  score: number;
}

/** 今日のいいところ／悪いところ。 */
export interface DailyPoint {
  area: string;
  /** group（通変星グループ）/ element（五行） */
  driver_kind: string;
  driver: string;
}

/** その日の運勢。気象を五行に置き換え、命式と重ねたもの。 */
export interface DailyFortune {
  reading: WeatherReading;
  sky: string;
  /** 今日の空気の五行構成比（%）。 */
  elements: RadarAxis[];
  /** 種族コード。同じ天気でもこれで出方が変わる。 */
  species: string;
  areas: DailyArea[];
  good: DailyPoint;
  bad: DailyPoint;
  /** 今日補われる五行 / さらに増える五行。 */
  fills: string[];
  floods: string[];
}

export interface FortuneResponse {
  year_pillar: Pillar;
  month_pillar: Pillar;
  day_pillar: Pillar;
  hour_pillar: Pillar;
  day_master: string;
  /** 古い API は返さないので任意扱い。 */
  species?: Species;
  /** 相性の良い人の概算。種族が出せない古い API では返らない。 */
  compatible?: CompatiblePopulation;
  sanmei?: Sanmei;
  /** 古い API は返さないので任意扱い（バックエンドの既定値は空配列）。 */
  charts?: RadarChart[];
}
