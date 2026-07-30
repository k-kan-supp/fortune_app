import { LANGS, useI18n, type Lang } from "@/i18n";

/** 言語切り替え（日本語 / English）。選択は localStorage に保存される。 */
const SHORT_LABELS: Record<Lang, string> = { ja: "日本語", en: "EN" };

export function LangSwitch() {
  const { lang, setLang, t } = useI18n();

  return (
    <div className="lang-switch" role="group" aria-label={t("lang.label")}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          className={l === lang ? "active" : undefined}
          aria-pressed={l === lang}
          onClick={() => setLang(l)}
        >
          {SHORT_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
