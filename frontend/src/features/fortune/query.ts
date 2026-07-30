import type { FortuneRequest } from "./types";

/**
 * 鑑定条件を URL のクエリで受け渡すための変換。
 * 結果ページを再読み込み・共有しても同じ命式を出せるようにする。
 */

export function toFortuneQuery(req: FortuneRequest): string {
  return new URLSearchParams({
    year: String(req.year),
    month: String(req.month),
    day: String(req.day),
    hour: String(req.hour),
    minute: String(req.minute),
    is_male: String(req.is_male),
  }).toString();
}

function int(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) ? value : null;
}

/** クエリを鑑定リクエストに戻す。年月日が揃っていなければ null。 */
export function parseFortuneQuery(params: URLSearchParams): FortuneRequest | null {
  const year = int(params, "year");
  const month = int(params, "month");
  const day = int(params, "day");
  if (year === null || month === null || day === null) return null;

  return {
    year,
    month,
    day,
    hour: int(params, "hour") ?? 12,
    minute: int(params, "minute") ?? 0,
    is_male: params.get("is_male") !== "false",
  };
}
