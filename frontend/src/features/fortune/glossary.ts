import { findMessage, type Lang } from "@/i18n";

/**
 * 用語解説の引き当て。
 * 「死」のようにチャートが違えば意味も違うコードがあるため、種別（ns）で分けて持つ。
 */

export interface TermRef {
  /** 用語の種別。i18n の glossary.<ns>.<code> に対応する。 */
  ns: string;
  code: string;
  /** ポップアップの見出しに出す表示名。 */
  label: string;
}

/** チャートの key と用語種別の対応。 */
const CHART_TERM_NS: Record<string, string> = {
  five_elements: "element",
  ten_stems: "stem",
  twelve_branches: "branch",
  ten_gods: "tenGod",
  ten_god_groups: "tenGodGroup",
  twelve_stages: "stage",
  pillar_energy: "pillar",
  seasonal_states: "seasonal",
  personality: "personality",
  life_areas: "lifeArea",
};

export const chartTermNs = (chartKey: string): string | undefined =>
  CHART_TERM_NS[chartKey];

/** 解説文。未登録の用語なら undefined（＝クリックできるようにしない）。 */
export const glossaryText = (ref: TermRef, lang: Lang): string | undefined =>
  findMessage(lang, `glossary.${ref.ns}.${ref.code}`);
