import type { MessageKey, Translate } from "@/i18n";
import type {
  BloodType,
  BodyType,
  DrinkingStatus,
  Education,
  Gender,
  MaritalStatus,
  SmokingStatus,
} from "./types";

/**
 * セレクト用の選択肢定義。
 * 保存する値は言語に依らないので、表示ラベルはメッセージキーで持つ。
 */
export interface OptionDef<T extends string> {
  value: T;
  labelKey: MessageKey;
}

export const GENDERS: OptionDef<Gender>[] = [
  { value: "male", labelKey: "options.gender.male" },
  { value: "female", labelKey: "options.gender.female" },
  { value: "other", labelKey: "options.gender.other" },
];

export const BODY_TYPES: OptionDef<BodyType>[] = [
  { value: "slim", labelKey: "options.bodyType.slim" },
  { value: "average", labelKey: "options.bodyType.average" },
  { value: "muscular", labelKey: "options.bodyType.muscular" },
  { value: "plump", labelKey: "options.bodyType.plump" },
];

export const BLOOD_TYPES: OptionDef<BloodType>[] = [
  { value: "A", labelKey: "options.bloodType.A" },
  { value: "B", labelKey: "options.bloodType.B" },
  { value: "O", labelKey: "options.bloodType.O" },
  { value: "AB", labelKey: "options.bloodType.AB" },
];

export const EDUCATIONS: OptionDef<Education>[] = [
  { value: "high_school", labelKey: "options.education.high_school" },
  { value: "vocational", labelKey: "options.education.vocational" },
  { value: "junior_college", labelKey: "options.education.junior_college" },
  { value: "university", labelKey: "options.education.university" },
  { value: "graduate", labelKey: "options.education.graduate" },
];

export const MARITAL_STATUSES: OptionDef<MaritalStatus>[] = [
  { value: "single", labelKey: "options.maritalStatus.single" },
  { value: "married", labelKey: "options.maritalStatus.married" },
  { value: "divorced", labelKey: "options.maritalStatus.divorced" },
];

export const SMOKING_STATUSES: OptionDef<SmokingStatus>[] = [
  { value: "no", labelKey: "options.smoking.no" },
  { value: "yes", labelKey: "options.smoking.yes" },
  { value: "sometimes", labelKey: "options.smoking.sometimes" },
  { value: "quit", labelKey: "options.smoking.quit" },
];

export const DRINKING_STATUSES: OptionDef<DrinkingStatus>[] = [
  { value: "no", labelKey: "options.drinking.no" },
  { value: "yes", labelKey: "options.drinking.yes" },
  { value: "sometimes", labelKey: "options.drinking.sometimes" },
];

/** 選択肢定義を <select> 用の {値, 表示ラベル} に変換する。 */
export function toOptions<T extends string>(
  defs: OptionDef<T>[],
  t: Translate,
): { value: T; label: string }[] {
  return defs.map((d) => ({ value: d.value, label: t(d.labelKey) }));
}

// 保存値は日本語名のまま。英語表示は i18n/prefectures.ts の対応表で行う。
export const PREFECTURES: string[] = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];
