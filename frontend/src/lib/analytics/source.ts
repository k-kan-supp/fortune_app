/**
 * 流入元の保持。
 *
 * 広告からの1クリックが購入まで繋がったかどうかは、流入元が**最後まで残って
 * いる**ことでしか分からない。途中の画面遷移で消えると CPA が計算できず、
 * 出稿の良し悪しを判断できなくなる。
 *
 * セッション単位で保つ。端末に恒久的に残すと、半年前の広告の手柄に
 * なり続けてしまう。
 */

const KEY = "acquisition-source";

/** 拾うクエリ。増やすときは集計側の分解軸と揃える。 */
const PARAMS = ["utm_source", "ref", "src"] as const;

function read(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/**
 * 初回の到達時に流入元を控える。以後の遷移では上書きしない
 * （最初に連れてきた経路の手柄を、途中の内部リンクに移さない）。
 */
export function captureSource(search: string): void {
  if (read() !== null) return;

  const params = new URLSearchParams(search);
  const found = PARAMS.map((name) => params.get(name)).find((v) => v !== null && v !== "");
  const referrer =
    typeof document !== "undefined" && document.referrer ? new URL(document.referrer).host : "";

  const value = found ?? (referrer && referrer !== window.location.host ? referrer : "direct");
  try {
    window.sessionStorage.setItem(KEY, value.slice(0, 64));
  } catch {
    /* 控えられなくても計測そのものは続ける */
  }
}

export function getSource(): string | null {
  return read();
}
