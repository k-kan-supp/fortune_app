/**
 * 計測の送信口。
 *
 * 画面側は `track()` だけを使う。送信先（当面は自前の API）を知っているのは
 * このファイルだけで、収集基盤を入れるときもここしか触らない。
 */

import { hasConsent } from "./consent";
import type { AnalyticsEventMap, EventName } from "./events";
import { getSource } from "./source";

export { getConsent, setConsent, hasConsent, type Consent } from "./consent";
export { captureSource, getSource } from "./source";
export { FUNNEL, type FunnelStage } from "./funnel";
export type { AnalyticsEventMap, EventName, PropValue } from "./events";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ENDPOINT = `${BASE_URL}/api/analytics/events`;

/** 1リクエストあたりの上限。サーバ側の max_length と合わせる。 */
const MAX_BATCH = 50;
/** まとめて送るまでの待ち時間。1イベント1リクエストにすると回線を圧迫する。 */
const FLUSH_DELAY_MS = 2000;

interface QueuedEvent {
  name: EventName;
  props: Record<string, unknown>;
}

let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function send(events: QueuedEvent[]): void {
  if (events.length === 0) return;
  // 流入元はイベントごとではなくバッチ単位。個々のイベント定義を汚さない。
  const body = JSON.stringify({ events, consent: hasConsent(), source: getSource() });

  // 離脱時にも落とさない。sendBeacon はページが閉じても送り切ってくれる。
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* 計測の失敗で画面を壊さない */
  });
}

export function flush(): void {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
  const pending = queue;
  queue = [];
  send(pending);
}

/**
 * イベントを1件積む。型に無い名前・個人特定プロパティはコンパイルで落ちる。
 *
 * 同意していない間は積まない。同意の判断はサーバでも再確認するので、
 * ここを迂回されても記録は残らない。
 */
export function track<K extends EventName>(name: K, props: AnalyticsEventMap[K]): void {
  if (!hasConsent()) return;

  queue.push({ name, props: props as Record<string, unknown> });
  if (queue.length >= MAX_BATCH) {
    flush();
    return;
  }
  if (timer === null) {
    timer = setTimeout(flush, FLUSH_DELAY_MS);
  }
}

// タブを閉じる・バックグラウンドに回る時点で送り切る
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}
