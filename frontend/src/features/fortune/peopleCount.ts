import type { Lang } from "@/i18n";

/**
 * 概算の人数を、桁が掴める形に丸めて表す。
 *
 * 4,400 万人と 44,005,068 人は同じ数だが、伝わり方が違う。ここは統計から
 * 積み上げた**概算**なので、有効数字を残して桁を見せるほうが誠実で、
 * 1 の位まで書くと精度があるように誤読させてしまう。
 */
export function formatPeople(people: number, lang: Lang): string {
  if (lang === "ja") {
    if (people >= 100_000_000) return `${round(people / 100_000_000)}億`;
    if (people >= 10_000) return `${round(people / 10_000).toLocaleString("ja-JP")}万`;
    return people.toLocaleString("ja-JP");
  }
  if (people >= 1_000_000) return `${round(people / 1_000_000)} million`;
  if (people >= 1_000) return `${round(people / 1_000)} thousand`;
  return String(people);
}

/** 有効数字2桁に落とす（44.005… → 44、4.4005… → 4.4）。 */
function round(value: number): number {
  return value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
}
