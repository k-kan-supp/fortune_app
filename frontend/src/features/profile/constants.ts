import type {
  BloodType,
  BodyType,
  DrinkingStatus,
  Education,
  Gender,
  MaritalStatus,
  SmokingStatus,
} from "./types";

/** セレクト用の {値: 表示ラベル} 定義。 */
export const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "男性" },
  { value: "female", label: "女性" },
  { value: "other", label: "その他" },
];

export const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: "slim", label: "細身" },
  { value: "average", label: "普通" },
  { value: "muscular", label: "筋肉質・がっちり" },
  { value: "plump", label: "ぽっちゃり" },
];

export const BLOOD_TYPES: { value: BloodType; label: string }[] = [
  { value: "A", label: "A型" },
  { value: "B", label: "B型" },
  { value: "O", label: "O型" },
  { value: "AB", label: "AB型" },
];

export const EDUCATIONS: { value: Education; label: string }[] = [
  { value: "high_school", label: "高校" },
  { value: "vocational", label: "専門学校" },
  { value: "junior_college", label: "短大" },
  { value: "university", label: "大学" },
  { value: "graduate", label: "大学院" },
];

export const MARITAL_STATUSES: { value: MaritalStatus; label: string }[] = [
  { value: "single", label: "未婚" },
  { value: "married", label: "既婚" },
  { value: "divorced", label: "離婚" },
];

export const SMOKING_STATUSES: { value: SmokingStatus; label: string }[] = [
  { value: "no", label: "吸わない" },
  { value: "yes", label: "吸う" },
  { value: "sometimes", label: "時々吸う" },
  { value: "quit", label: "やめた" },
];

export const DRINKING_STATUSES: { value: DrinkingStatus; label: string }[] = [
  { value: "no", label: "飲まない" },
  { value: "yes", label: "飲む" },
  { value: "sometimes", label: "時々飲む" },
];

export const PREFECTURES: string[] = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];
