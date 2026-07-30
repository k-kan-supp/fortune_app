import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { isAuthenticated } from "@/features/auth/authStorage";
import { BirthInputForm } from "@/features/fortune/components/BirthInputForm";
import { MeishikiTable } from "@/features/fortune/components/MeishikiTable";
import { profileToFortuneDefaults } from "@/features/fortune/fromProfile";
import { useFortune } from "@/features/fortune/hooks/useFortune";
import type { FortuneRequest } from "@/features/fortune/types";
import { getProfile } from "@/features/profile/api/profileApi";
import { useI18n } from "@/i18n";

// mark（暦・盤・縁）は装飾の紋章なので言語によらず共通。
const STEPS = [
  { n: 1, mark: "暦", key: "input" },
  { n: 2, mark: "盤", key: "chart" },
  { n: 3, mark: "縁", key: "meet" },
] as const;

export function FortunePage() {
  const { result, loading, error, submit } = useFortune();
  const [defaults, setDefaults] = useState<Partial<FortuneRequest>>();
  const [prefilled, setPrefilled] = useState(false);
  // 入力フォームは「鑑定する」を押してから表示する
  const [formOpen, setFormOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const loggedIn = isAuthenticated();
  const { t } = useI18n();

  // 開いたらフォームの先頭までスクロールし、そのまま入力に移れるようにする
  useEffect(() => {
    if (formOpen) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [formOpen]);

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
    <main>
      <section className="hero">
        <div className="hero-mark">✦</div>
        <h1 className="hero-title">{t("fortune.heroTitle")}</h1>
        <p className="hero-sub">{t("fortune.heroSub")}</p>
      </section>

      <div className="wrap-wide">
        <div className="step-cards">
          {STEPS.map((s) => (
            <article key={s.n} className={`step-card step-card--${s.n}`}>
              <div className="step-art">{s.mark}</div>
              <span className="step-badge">{t("fortune.stepBadge", { n: s.n })}</span>
              <h2>{t(`fortune.steps.${s.key}.title`)}</h2>
              <p>{t(`fortune.steps.${s.key}.body`)}</p>
            </article>
          ))}
        </div>

        {formOpen ? (
          <div ref={formRef}>
            {prefilled && (
              <p className="hint prefill-note">
                {t("fortune.prefillNote")}
                <Link to="/profile">{t("fortune.prefillEdit")}</Link>
              </p>
            )}

            <BirthInputForm initial={defaults} onSubmit={submit} loading={loading} />
          </div>
        ) : (
          <div className="start-cta">
            <button type="button" className="q-submit" onClick={() => setFormOpen(true)}>
              {t("fortune.startCta")}
            </button>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        {result && (
          <section className="result-section">
            <div className="result-head">
              <h2>{t("fortune.resultTitle")}</h2>
              <p className="hint">{t("fortune.resultHint")}</p>
            </div>
            <MeishikiTable result={result} />
          </section>
        )}

        <p className="back-link">
          {loggedIn ? (
            <Link to="/profile">{t("fortune.toProfile")}</Link>
          ) : (
            <Link to="/register">{t("fortune.toRegister")}</Link>
          )}
        </p>
      </div>
    </main>
  );
}
