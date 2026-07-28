export type Gender = "male" | "female" | "other";
export type BodyType = "slim" | "average" | "muscular" | "plump";
export type BloodType = "A" | "B" | "O" | "AB";
export type Education =
  | "high_school"
  | "vocational"
  | "junior_college"
  | "university"
  | "graduate";
export type MaritalStatus = "single" | "married" | "divorced";
export type SmokingStatus = "no" | "yes" | "sometimes" | "quit";
export type DrinkingStatus = "no" | "yes" | "sometimes";

export interface Profile {
  email: string;
  avatar_url: string | null;

  // 基本情報
  display_name: string | null;
  birthday: string | null; // ISO date (YYYY-MM-DD)
  birth_time: string | null; // HH:MM:SS
  gender: Gender | null;

  // 身体・マッチング項目
  height_cm: number | null;
  weight_kg: number | null;
  body_type: BodyType | null;
  blood_type: BloodType | null;
  occupation: string | null;
  education: Education | null;
  prefecture: string | null;
  marital_status: MaritalStatus | null;
  smoking: SmokingStatus | null;
  drinking: DrinkingStatus | null;
  bio: string | null;
}

/** 更新可能なフィールドのみ（メール・アイコンを除く）。 */
export type ProfileUpdate = Partial<Omit<Profile, "email" | "avatar_url">>;
