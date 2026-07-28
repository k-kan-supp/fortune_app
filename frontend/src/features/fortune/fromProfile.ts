import type { Profile } from "@/features/profile/types";
import type { FortuneRequest } from "./types";

/** プロフィールの生年月日時・性別を鑑定フォームの初期値へ変換する。 */
export function profileToFortuneDefaults(p: Profile): Partial<FortuneRequest> {
  const d: Partial<FortuneRequest> = {};

  if (p.birthday) {
    const [year, month, day] = p.birthday.split("-").map(Number);
    Object.assign(d, { year, month, day });
  }
  if (p.birth_time) {
    const [hour, minute] = p.birth_time.split(":").map(Number);
    Object.assign(d, { hour, minute });
  }
  if (p.gender === "male") d.is_male = true;
  else if (p.gender === "female") d.is_male = false;

  return d;
}
