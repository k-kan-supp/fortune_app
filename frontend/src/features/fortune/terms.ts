import type { Lang } from "@/i18n";

/**
 * 四柱推命の用語の英語表記。
 * API は漢字（甲・子・比肩…）を返すので、英語表示のときだけ訳語を添える。
 */

const STEM_EN: Record<string, string> = {
  甲: "Yang Wood",
  乙: "Yin Wood",
  丙: "Yang Fire",
  丁: "Yin Fire",
  戊: "Yang Earth",
  己: "Yin Earth",
  庚: "Yang Metal",
  辛: "Yin Metal",
  壬: "Yang Water",
  癸: "Yin Water",
};

const BRANCH_EN: Record<string, string> = {
  子: "Rat",
  丑: "Ox",
  寅: "Tiger",
  卯: "Rabbit",
  辰: "Dragon",
  巳: "Snake",
  午: "Horse",
  未: "Goat",
  申: "Monkey",
  酉: "Rooster",
  戌: "Dog",
  亥: "Pig",
};

const TEN_GOD_EN: Record<string, string> = {
  比肩: "Friend",
  劫財: "Rob Wealth",
  食神: "Eating God",
  傷官: "Hurting Officer",
  偏財: "Indirect Wealth",
  正財: "Direct Wealth",
  偏官: "Seven Killings",
  正官: "Direct Officer",
  偏印: "Indirect Resource",
  印綬: "Direct Resource",
};

/** 英語では漢字に訳語を添える（未知の文字はそのまま）。 */
function gloss(value: string, dict: Record<string, string>, lang: Lang): string {
  if (lang === "ja") return value;
  const en = dict[value];
  return en ? `${value} ${en}` : value;
}

export const stemLabel = (stem: string, lang: Lang): string => gloss(stem, STEM_EN, lang);

export const branchLabel = (branch: string, lang: Lang): string =>
  gloss(branch, BRANCH_EN, lang);

/** 十神は括弧内に出すため、英語では訳語のみを返す。 */
export const tenGodLabel = (tenGod: string, lang: Lang): string =>
  lang === "ja" ? tenGod : (TEN_GOD_EN[tenGod] ?? tenGod);

export const hiddenStemsLabel = (stems: string[], lang: Lang): string =>
  lang === "ja"
    ? stems.join("・")
    : stems.map((s) => stemLabel(s, lang)).join(", ");
