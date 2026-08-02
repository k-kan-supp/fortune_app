/**
 * 主ファネル。
 *
 * **1本しか定義しない。** 増やすと誰も見なくなり、見ない指標は無いのと同じ。
 * 段階ごとの脱落だけを見て、どこを直すかを決める。
 *
 *   流入 → 入力開始 → 入力完了 → 結果表示 → 有料提示 → 購入
 *
 * 名前は後から変えない。変えた時点で過去のデータと繋がらなくなり、
 * 「直した結果どうなったか」が測れなくなる。足すのは良いが、直さない。
 *
 * 分解軸は**流入元ひとつだけ**。軸を増やすと母数が割れて、どの数字も
 * 判断に使えなくなる。流入元は `source.ts` が拾って全イベントに付ける。
 */

import type { EventName } from "./events";

export interface FunnelStage {
  /** 段階の識別子。集計側の並び順にもなる。 */
  id: string;
  /** その段階に到達したとみなすイベント。 */
  event: EventName | "purchase_completed";
}

/** 上から順に、後段が前段を上回ることはない（上回ったら計測が壊れている）。 */
export const FUNNEL: readonly FunnelStage[] = [
  { id: "arrived", event: "page_viewed" },
  { id: "input_started", event: "fortune_input_started" },
  { id: "input_completed", event: "fortune_calculated" },
  { id: "result_seen", event: "result_viewed" },
  { id: "paywall_seen", event: "paywall_shown" },
  // 課金の数字はクライアントの送信に依存させない。サーバから届く。
  { id: "purchased", event: "purchase_completed" },
] as const;
