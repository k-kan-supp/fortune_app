import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/features/auth/authStorage";
import { BirthInputModal } from "@/features/fortune/components/BirthInputModal";
import { profileToFortuneDefaults } from "@/features/fortune/fromProfile";
import { toFortuneQuery } from "@/features/fortune/query";
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
  // プロフィール由来の初期値。届いていれば「反映しました」の注記も出す。
  const [defaults, setDefaults] = useState<Partial<FortuneRequest>>();
  // 入力フォームは「鑑定する」を押すとポップアップで開く
  const [formOpen, setFormOpen] = useState(false);
  const profileRequested = useRef(false);
  const loggedIn = isAuthenticated();
  const navigate = useNavigate();
  const { t } = useI18n();

  function openForm() {
    setFormOpen(true);

    // 生年月日の初期値は、フォームを開いたときに一度だけ取りに行く
    if (!loggedIn || profileRequested.current) return;
    profileRequested.current = true;
    getProfile()
      .then((p) => {
        const d = profileToFortuneDefaults(p);
        if (Object.keys(d).length > 0) setDefaults(d);
      })
      .catch(() => {
        /* 未設定・取得失敗は無視（手入力で使える） */
      });
  }

  // 鑑定は結果ページで行う。入力値はクエリで渡す。
  function openResult(req: FortuneRequest) {
    setFormOpen(false);
    navigate(`/result?${toFortuneQuery(req)}`);
  }

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

        <div className="start-cta">
          <button type="button" className="q-submit" onClick={openForm}>
            {t("fortune.startCta")}
          </button>
        </div>

        {formOpen && (
          <BirthInputModal
            onClose={() => setFormOpen(false)}
            onSubmit={openResult}
            initial={defaults}
            note={
              defaults ? (
                <p className="hint prefill-note">
                  {t("fortune.prefillNote")}
                  <Link to="/profile">{t("fortune.prefillEdit")}</Link>
                </p>
              ) : undefined
            }
          />
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
