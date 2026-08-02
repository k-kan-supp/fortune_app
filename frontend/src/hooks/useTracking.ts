/**
 * 計測の呼び出しを1か所にまとめる。
 *
 * 各コンポーネントから直接 `track` を撒くと、送信漏れと二重送信が必ず起きる
 * ── どちらも数字を静かに壊すので、気づいたときには比較できるデータが無い。
 * 画面側はここのフックだけを使う。
 */

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { captureSource, track } from "@/lib/analytics";

/** ファネル先頭。経路が変わるたびに1回だけ送る。 */
export function usePageView(): void {
  const { pathname, search } = useLocation();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // 最初に連れてきた経路を控える（以後の内部遷移では上書きしない）
    captureSource(search);
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    track("page_viewed", { path: pathname });
  }, [pathname, search]);
}

/** 到達を記録する深さ（％）。細かく刻んでも判断は変わらない。 */
const DEPTHS = [25, 50, 75, 100] as const;

/**
 * 結果をどこまで読んだかを段階で記録する。
 *
 * 壁の位置（M29）を動かしたときの良し悪しは、これが無いと判断できない
 * ── 「壁まで届いていない」のか「届いたが買わない」のかが区別できないため。
 */
export function useScrollDepth(enabled: boolean): void {
  const reached = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    function onScroll() {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      // 画面に収まっていれば読み切ったのと同じ
      const ratio = scrollable <= 0 ? 100 : ((window.scrollY / scrollable) * 100);

      for (const depth of DEPTHS) {
        if (ratio + 0.5 >= depth && !reached.current.has(depth)) {
          reached.current.add(depth);
          track("result_scrolled", { depth });
        }
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled]);
}
