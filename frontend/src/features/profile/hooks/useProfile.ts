import { useCallback, useEffect, useState } from "react";
import { getLang, translate } from "@/i18n";
import { errorMessage } from "@/lib/errors";
import {
  getProfile,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from "../api/profileApi";
import type { Profile, ProfileUpdate } from "../types";
import { notifyProfileUpdated } from "./useProfileSummary";

/** プロフィールの取得・更新・アイコン操作をまとめて扱うフック。 */
export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (fn: () => Promise<Profile>) => {
    setError(null);
    try {
      setProfile(await fn());
    } catch (e) {
      setError(
        errorMessage(e, translate(getLang(), "errors.generic")),
      );
    }
  }, []);

  useEffect(() => {
    run(getProfile).finally(() => setLoading(false));
  }, [run]);

  // アイコンと表示名はナビの右上にも出ているので、変更したら知らせる
  const runAndNotify = async (fn: () => Promise<Profile>) => {
    await run(fn);
    notifyProfileUpdated();
  };

  return {
    profile,
    loading,
    error,
    save: (data: ProfileUpdate) => runAndNotify(() => updateProfile(data)),
    changeAvatar: (file: File) => runAndNotify(() => uploadAvatar(file)),
    deleteAvatar: () => runAndNotify(removeAvatar),
  };
}
