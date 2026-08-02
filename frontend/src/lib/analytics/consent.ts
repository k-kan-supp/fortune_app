/**
 * 計測への同意。
 *
 * 後から同意基盤を足すのは大変なので、最初から入れる。同意していない間は
 * 画面側の計測を送らない（サーバ側でも落とすが、そもそも送らないのが本筋）。
 */

const KEY = "analytics-consent";

export type Consent = "granted" | "denied" | "unset";

/** localStorage が使えない環境（プライベートモード等）でも落ちないようにする。 */
function read(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function getConsent(): Consent {
  const value = read();
  return value === "granted" || value === "denied" ? value : "unset";
}

export function setConsent(next: Exclude<Consent, "unset">): void {
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    /* 保存できなくても、そのセッションの判断は呼び出し側が保持する */
  }
}

export const hasConsent = (): boolean => getConsent() === "granted";
