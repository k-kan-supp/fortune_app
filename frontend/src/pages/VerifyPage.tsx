import { Link, useSearchParams } from "react-router-dom";
import { useVerify } from "@/features/auth/hooks/useVerify";
import { useI18n } from "@/i18n";

/** メールの登録用URL (/auth/verify?token=...) の遷移先。 */
export function VerifyPage() {
  const [params] = useSearchParams();
  const { status, user, error } = useVerify(params.get("token"));
  const { t } = useI18n();

  return (
    <main className="container">
      <div className="auth-card">
        {status === "verifying" && <p>{t("verify.verifying")}</p>}

        {status === "success" && (
          <>
            <h1>{t("verify.successTitle")}</h1>
            <p>{t("verify.loggedInAs", { email: user?.email ?? "" })}</p>
            <Link to="/">{t("verify.toFortune")}</Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1>{t("verify.errorTitle")}</h1>
            <p className="error">{error}</p>
            <Link to="/register">{t("verify.retry")}</Link>
          </>
        )}
      </div>
    </main>
  );
}
