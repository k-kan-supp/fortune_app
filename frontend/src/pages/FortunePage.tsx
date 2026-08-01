import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/features/auth/authStorage";
import { BirthInputModal } from "@/features/fortune/components/BirthInputModal";
import { profileToFortuneDefaults } from "@/features/fortune/fromProfile";
import { toFortuneQuery } from "@/features/fortune/query";
import type { FortuneRequest } from "@/features/fortune/types";
import { getProfile } from "@/features/profile/api/profileApi";
import { useI18n } from "@/i18n";

// 紋章は線画のみの白黒アイコン。色は .step-art の currentColor に従う。
const ICON = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/** 1. 生年月日を入れる — 暦。 */
function CalendarMark() {
  return (
    <svg {...ICON}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.6" />
      <path d="M3.5 10.5h17M8 3v4.2M16 3v4.2" />
      <circle cx="12" cy="15.4" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 2. 命式とチャートを読む — 五角形のレーダー。 */
function ChartMark() {
  return (
    <svg {...ICON}>
      <path d="M12 2.6 20.94 9.1 17.53 19.6H6.47L3.06 9.1Z" />
      <path d="M12 7.3 16.47 10.55 14.76 15.8H9.24L7.53 10.55Z" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 3. 相手と出会う — 縁を重なる二つの輪で表す。 */
function BondMark() {
  return (
    <svg {...ICON}>
      <circle cx="9" cy="12" r="5.9" />
      <circle cx="15" cy="12" r="5.9" />
    </svg>
  );
}

const STEPS = [
  { n: 1, Mark: CalendarMark, key: "input" },
  { n: 2, Mark: ChartMark, key: "chart" },
  { n: 3, Mark: BondMark, key: "meet" },
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
              <div className="step-art">
                <s.Mark />
              </div>
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
