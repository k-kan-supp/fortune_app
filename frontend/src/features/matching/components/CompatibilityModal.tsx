import { useEffect, useState } from "react";
import { Modal, ModalCloseButton } from "@/components/ui/Modal";
import { findMessage, getLang, translate, useI18n } from "@/i18n";
import { errorMessage } from "@/lib/errors";
import { getCompatibility } from "../api/matchingApi";
import type { Compatibility } from "../types";

interface Props {
  userId: string;
  /** 見出しに出す相手の名前。 */
  name: string;
  onClose: () => void;
}

/** 候補カードをタップしたときに出る、四柱推命の相性ポップアップ。 */
export function CompatibilityModal({ userId, name, onClose }: Props) {
  const [result, setResult] = useState<Compatibility | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t, lang } = useI18n();

  useEffect(() => {
    let active = true;
    getCompatibility(userId)
      .then((r) => active && setResult(r))
      .catch(
        (e) =>
          active && setError(errorMessage(e, translate(getLang(), "errors.fetch"))),
      );
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <Modal onClose={onClose} cardClassName="compat-modal-card" labelledBy="compat-modal-title">
      <div className="term-modal-head">
        <p className="term-modal-eyebrow">{t("compat.title")}</p>
        <ModalCloseButton onClose={onClose} />
      </div>

      <h2 id="compat-modal-title">{name}</h2>

      {error && <p className="error">{error}</p>}
      {!result && !error && <p className="hint">{t("common.loading")}</p>}

      {result && (
        <>
          <p className="compat-score">
            <span className="compat-score-value">{Math.round(result.score)}</span>
            <span className="compat-score-unit">/ 100</span>
          </p>

          <ul className="compat-facets">
            {result.facets.map((facet) => (
              <li key={facet.code}>
                <span className="compat-facet-label">
                  {findMessage(lang, `compat.facets.${facet.code}`) ?? facet.code}
                </span>
                <span className="compat-bar" aria-hidden="true">
                  <span style={{ width: `${Math.max(0, Math.min(facet.value, 100))}%` }} />
                </span>
                <span className="compat-facet-value">{Math.round(facet.value)}</span>
                {/* その面が何を見ているかを一行添える */}
                <span className="compat-facet-note">
                  {findMessage(lang, `compat.facetNotes.${facet.code}`) ?? ""}
                </span>
              </li>
            ))}
          </ul>

          <ul className="compat-notes">
            {result.notes.map((note) => (
              <li key={note}>{findMessage(lang, `compat.notes.${note}`) ?? note}</li>
            ))}
          </ul>
        </>
      )}
    </Modal>
  );
}
