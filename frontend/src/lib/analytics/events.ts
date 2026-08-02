/**
 * 計測イベントの型定義。
 *
 * ここに無いイベントは送れない（`track` の型引数で落ちる）。文字列で自由に送れる
 * 設計にすると、半年後には表記揺れで集計できないイベントが数百種類できる。
 *
 * サーバ側の登録簿は `backend/app/services/analytics/events.py`。
 * 名前を足すときは**両方**に足す。片方だけだと 422 で弾かれる。
 */

/** プロパティに使える値。自由な入れ子を許すと、後から何でも入る。 */
export type PropValue = string | number | boolean | null;

/**
 * プロパティ名に含まれていたら個人特定とみなす断片。
 * 誤検出しない語だけに絞る（"lat" は "related" に当たるので入れない）。
 */
type PersonalFragment = "birth" | "dob" | "email" | "phone" | "address" | "name";

/** 個人特定に繋がる名前かどうかを、名前の綴りだけから判定する。 */
type IsPersonalKey<K extends string> =
  Lowercase<K> extends `${string}${PersonalFragment}${string}` ? true : false;

/**
 * 個人特定プロパティを `never` に潰す。
 * `{ birth_year: 1990 }` は代入できなくなり、呼び出し側がコンパイルエラーになる。
 */
type Safe<T extends Record<string, Record<string, PropValue>>> = {
  [E in keyof T]: {
    [K in keyof T[E] & string]: IsPersonalKey<K> extends true ? never : T[E][K];
  };
};

/**
 * イベント一覧。命名は `<対象>_<動作>`。
 * 動作を後ろに置くと、一覧が対象ごとに並ぶ。
 */
export type AnalyticsEventMap = Safe<{
  page_viewed: { path: string };
  fortune_input_started: { source: string };
  /** 生年月日は載せない。分析に要るのは日干であって、日付そのものではない。 */
  fortune_calculated: { day_stem: string; time_known: boolean };
  result_viewed: { chart_count: number };
  paywall_shown: { section: string; preview_blocks: number };
  paywall_dismissed: { section: string };
  signup_started: { trigger: string };
  signup_completed: { trigger: string };
}>;

export type EventName = keyof AnalyticsEventMap & string;
