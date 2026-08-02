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

/**
 * レーダーチャートの軸ラベル。
 * 軸に収まる短さが要るので、`stemLabel` のような「漢字＋訳語」の併記はしない。
 * 十二支・通変星などは既存の訳語辞書をそのまま流用する。
 */
/**
 * 算命学の星の訳語。API は漢字（貫索星・天将星…）を返すので、英語表示のときだけ添える。
 * 十大主星は十神の、十二大従星は十二運星の読み替えなので、意味は対応する語に寄せてある。
 */
const SANMEI_STAR_EN: Record<string, string> = {
  // 十大主星
  貫索星: "Steadfast Star",
  石門星: "Gateway Star",
  鳳閣星: "Phoenix Star",
  調舒星: "Lyric Star",
  禄存星: "Bounty Star",
  司禄星: "Steward Star",
  車騎星: "Charge Star",
  牽牛星: "Herdsman Star",
  龍高星: "Dragon Star",
  玉堂星: "Scholar Star",
  // 十二大従星
  天報星: "Herald Star",
  天印星: "Seal Star",
  天貴星: "Noble Star",
  天恍星: "Reverie Star",
  天南星: "Southern Star",
  天禄星: "Stipend Star",
  天将星: "General Star",
  天堂星: "Hall Star",
  天胡星: "Wanderer Star",
  天極星: "Terminus Star",
  天庫星: "Vault Star",
  天馳星: "Courier Star",
};

/** 算命学の星の表示名。日本語は漢字のまま。 */
export function starLabel(star: string, lang: Lang): string {
  return lang === "ja" ? star : (SANMEI_STAR_EN[star] ?? star);
}

const AXIS_EN: Record<string, string> = {
  // 五行
  木: "Wood",
  火: "Fire",
  土: "Earth",
  金: "Metal",
  水: "Water",
  // 通変星グループ
  比劫: "Self",
  食傷: "Output",
  財星: "Wealth",
  官殺: "Power",
  印星: "Resource",
  // 十二運星
  長生: "Growth",
  沐浴: "Bath",
  冠帯: "Cap",
  建禄: "Prime",
  帝旺: "Emperor",
  衰: "Decline",
  病: "Illness",
  死: "Death",
  墓: "Grave",
  絶: "Void",
  胎: "Conception",
  養: "Nurture",
  // 官位（旺相休囚死）
  旺: "Peak",
  相: "Rising",
  休: "Resting",
  囚: "Trapped",
  // 四柱（十二支の「死」と衝突しないよう、柱は英語コードで届く）
  year: "Year",
  month: "Month",
  day: "Day",
  hour: "Hour",
  // 性格特性
  independence: "Independence",
  expression: "Expression",
  sociability: "Sociability",
  action: "Drive",
  discipline: "Discipline",
  curiosity: "Curiosity",
  // 分野別運勢
  career: "Career",
  wealth: "Wealth",
  love: "Love",
  health: "Health",
  relationships: "Relationships",
  study: "Study",
};

const AXIS_JA: Record<string, string> = {
  year: "年柱",
  month: "月柱",
  day: "日柱",
  hour: "時柱",
  independence: "自立心",
  expression: "表現力",
  sociability: "社交性",
  action: "実行力",
  discipline: "規律性",
  curiosity: "探究心",
  career: "仕事運",
  wealth: "金運",
  love: "恋愛運",
  health: "健康運",
  relationships: "人間関係運",
  study: "学習運",
};

/**
 * 同じコードでもチャートによって意味が変わる軸の訳語。
 * 例: 「死」は十二運星では Death（動きが止まる時期）、
 * 官位では旺に剋されて最も勢いを失った状態を指す。
 */
const AXIS_EN_BY_NS: Record<string, Record<string, string>> = {
  seasonal: { 死: "Dormant" },
};

/**
 * 軸コード（"木" / "甲" / "career" など）を表示名に変換する。
 * ``ns``（用語の種別）を渡すと、コードが重なる軸を種別ごとに訳し分ける。
 */
export function axisLabel(code: string, lang: Lang, ns?: string): string {
  if (lang === "ja") return AXIS_JA[code] ?? code;
  const scoped = ns ? AXIS_EN_BY_NS[ns]?.[code] : undefined;
  return (
    scoped ?? AXIS_EN[code] ?? BRANCH_EN[code] ?? TEN_GOD_EN[code] ?? STEM_EN[code] ?? code
  );
}
