import { useState } from "react";
import { useI18n } from "@/i18n";
import { getConsent, setConsent } from "@/lib/analytics";

/**
 * 計測への同意を尋ねる。未回答のときだけ出す。
 *
 * 画面を覆わない位置に置く。同意を取るために本文を読ませないのは本末転倒で、
 * 特に検索から来た人の初回体験（G31）を潰す。
 */
export function ConsentBanner() {
  const { t } = useI18n();
  const [answered, setAnswered] = useState(() => getConsent() !== "unset");

  if (answered) return null;

  const answer = (value: "granted" | "denied") => {
    setConsent(value);
    setAnswered(true);
  };

  return (
    <div className="consent-banner" role="region" aria-label={t("analytics.consent.body")}>
      <p className="consent-banner__body">{t("analytics.consent.body")}</p>
      <div className="consent-banner__actions">
        <button type="button" className="consent-banner__deny" onClick={() => answer("denied")}>
          {t("analytics.consent.decline")}
        </button>
        <button type="button" className="consent-banner__allow" onClick={() => answer("granted")}>
          {t("analytics.consent.accept")}
        </button>
      </div>
    </div>
  );
}
