import { Link, useSearchParams } from "react-router-dom";
import { useVerify } from "@/features/auth/hooks/useVerify";

/** メールの登録用URL (/auth/verify?token=...) の遷移先。 */
export function VerifyPage() {
  const [params] = useSearchParams();
  const { status, user, error } = useVerify(params.get("token"));

  return (
    <main className="container">
      <div className="auth-card">
        {status === "verifying" && <p>登録を確認しています…</p>}

        {status === "success" && (
          <>
            <h1>登録が完了しました 🎉</h1>
            <p>{user?.email} でログインしました。</p>
            <Link to="/">四柱推命を鑑定する →</Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1>確認できませんでした</h1>
            <p className="error">{error}</p>
            <Link to="/register">登録をやり直す</Link>
          </>
        )}
      </div>
    </main>
  );
}
