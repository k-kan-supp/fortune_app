/**
 * 未登録のまま出した鑑定条件を、端末側に控えておく。
 *
 * 登録を先に求めると価値が伝わる前に離脱するので、命式は認証なしで出し切る。
 * その代わり、登録した瞬間に「さっき見ていたもの」を失わせない。ここで再入力を
 * 求めると、せっかく登録した人をそこで落とす。
 *
 * サーバには置かない。未登録の人の生年月日を、本人が会員になる前から
 * こちらが預かる状態を作らない。
 */

import type { FortuneRequest } from "./types";

const KEY = "pending-reading";

/** localStorage が使えない環境でも落ちないようにする。 */
function safeGet(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function rememberReading(req: FortuneRequest): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(req));
  } catch {
    /* 控えられなくても鑑定そのものは成立する */
  }
}

export function forgetReading(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* 消せなくても実害は無い */
  }
}

/** 控えてある鑑定条件を取り出す。形が違えば無かったことにする。 */
export function recallReading(): FortuneRequest | null {
  const raw = safeGet();
  if (raw === null) return null;

  try {
    const value: unknown = JSON.parse(raw);
    if (value === null || typeof value !== "object") return null;
    const req = value as Partial<FortuneRequest>;
    if (
      typeof req.year !== "number" ||
      typeof req.month !== "number" ||
      typeof req.day !== "number"
    ) {
      return null;
    }
    return {
      year: req.year,
      month: req.month,
      day: req.day,
      hour: typeof req.hour === "number" ? req.hour : 12,
      minute: typeof req.minute === "number" ? req.minute : 0,
      is_male: req.is_male !== false,
    };
  } catch {
    return null;
  }
}
