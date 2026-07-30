import { useEffect } from "react";
import { useI18n } from "@/i18n";
import { glossaryText, glossaryTitle, type TermRef } from "../glossary";

interface Props {
  term: TermRef;
  onClose: () => void;
}

/** 用語（軸ラベル・日主など）の意味を出すポップアップ。 */
export function TermModal({ term, onClose }: Props) {
  const { t, lang } = useI18n();
  const body = glossaryText(term, lang);

  // Esc でも閉じられるようにする
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="term-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="term-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="term-modal-head">
          <p className="term-modal-eyebrow">{t("glossary.heading")}</p>
          <button
            type="button"
            className="modal-close"
            aria-label={t("common.close")}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <h2 id="term-modal-title">{glossaryTitle(term, lang)}</h2>
        <p className="term-modal-body">{body}</p>
      </div>
    </div>
  );
}
