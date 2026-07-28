import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAuthenticated } from "@/features/auth/authStorage";
import { BirthInputForm } from "@/features/fortune/components/BirthInputForm";
import { MeishikiTable } from "@/features/fortune/components/MeishikiTable";
import { profileToFortuneDefaults } from "@/features/fortune/fromProfile";
import { useFortune } from "@/features/fortune/hooks/useFortune";
import type { FortuneRequest } from "@/features/fortune/types";
import { getProfile } from "@/features/profile/api/profileApi";

export function FortunePage() {
  const { result, loading, error, submit } = useFortune();
  const [defaults, setDefaults] = useState<Partial<FortuneRequest>>();
  const [prefilled, setPrefilled] = useState(false);
  const loggedIn = isAuthenticated();

  // ログイン済みならプロフィールの生年月日を初期値に反映する
  useEffect(() => {
    if (!loggedIn) return;
    getProfile()
      .then((p) => {
        const d = profileToFortuneDefaults(p);
        if (Object.keys(d).length > 0) {
          setDefaults(d);
          setPrefilled(true);
        }
      })
      .catch(() => {
        /* 未ログイン・未設定は無視（手入力で使える） */
      });
  }, [loggedIn]);

  return (
    <main className="container">
      <h1>四柱推命</h1>

      {prefilled && (
        <p className="hint prefill-note">
          プロフィールの生年月日を反映しました。<Link to="/profile">編集する</Link>
        </p>
      )}

      <BirthInputForm initial={defaults} onSubmit={submit} loading={loading} />
      {error && <p className="error">{error}</p>}
      {result && <MeishikiTable result={result} />}

      <p className="back-link">
        {loggedIn ? (
          <Link to="/profile">プロフィール設定 →</Link>
        ) : (
          <Link to="/register">ユーザー登録して生年月日を保存 →</Link>
        )}
      </p>
    </main>
  );
}
