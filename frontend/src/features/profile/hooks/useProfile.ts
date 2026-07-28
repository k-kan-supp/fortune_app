import { useCallback, useEffect, useState } from "react";
import {
  getProfile,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from "../api/profileApi";
import type { Profile, ProfileUpdate } from "../types";

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
      setError(e instanceof Error ? e.message : "エラーが発生しました。");
    }
  }, []);

  useEffect(() => {
    run(getProfile).finally(() => setLoading(false));
  }, [run]);

  return {
    profile,
    loading,
    error,
    save: (data: ProfileUpdate) => run(() => updateProfile(data)),
    changeAvatar: (file: File) => run(() => uploadAvatar(file)),
    deleteAvatar: () => run(removeAvatar),
  };
}
