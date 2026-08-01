import { useEffect, useState } from "react";
import { profileToFortuneDefaults } from "@/features/fortune/fromProfile";
import { toFortuneQuery } from "@/features/fortune/query";
import type { FortuneRequest } from "@/features/fortune/types";
import { getProfile } from "../api/profileApi";

/** プロフィールを変えたときに、ナビの表示も追従させるための合図。 */
export const PROFILE_UPDATED_EVENT = "profile:updated";

export function notifyProfileUpdated(): void {
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
}

export interface ProfileSummary {
  avatarUrl: string | null;
  /** アイコン未設定のときに出す1文字（表示名 → メールの頭文字）。 */
  initial: string;
  /** 保存済みの生年月日から作った結果ページのクエリ。未設定なら null。 */
  fortuneQuery: string | null;
}

const EMPTY: ProfileSummary = { avatarUrl: null, initial: "", fortuneQuery: null };

/** 生年月日が揃っているときだけ、結果ページのクエリを作る（時刻は既定 12 時）。 */
function toQuery(defaults: Partial<FortuneRequest>): string | null {
  const { year, month, day } = defaults;
  if (year === undefined || month === undefined || day === undefined) return null;
  return toFortuneQuery({
    year,
    month,
    day,
    hour: defaults.hour ?? 12,
    minute: defaults.minute ?? 0,
    is_male: defaults.is_male ?? true,
  });
}

/**
 * ナビ右上で使う、自分のプロフィールの要約。
 * プロフィール変更後は PROFILE_UPDATED_EVENT で取り直す。
 */
export function useProfileSummary(): ProfileSummary {
  const [summary, setSummary] = useState<ProfileSummary>(EMPTY);

  useEffect(() => {
    let active = true;

    const load = () =>
      getProfile()
        .then((p) => {
          if (!active) return;
          const name = p.display_name?.trim() || p.email;
          setSummary({
            avatarUrl: p.avatar_url,
            initial: name.slice(0, 1).toUpperCase(),
            fortuneQuery: toQuery(profileToFortuneDefaults(p)),
          });
        })
        .catch(() => {
          /* 取得できなければ既定のプレースホルダのままにする */
        });

    load();
    window.addEventListener(PROFILE_UPDATED_EVENT, load);
    return () => {
      active = false;
      window.removeEventListener(PROFILE_UPDATED_EVENT, load);
    };
  }, []);

  return summary;
}
