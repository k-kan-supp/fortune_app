import { useState } from "react";
import { Link } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import type { CandidateFilters } from "@/features/matching/api/matchingApi";
import { CandidateCard } from "@/features/matching/components/CandidateCard";
import { CandidateFilter } from "@/features/matching/components/CandidateFilter";
import { useCandidates } from "@/features/matching/hooks/useCandidates";
import { useI18n } from "@/i18n";

export function DiscoverPage() {
  const [filters, setFilters] = useState<CandidateFilters>({});
  const { current, loading, error, matchedWith, dismissMatch, like, pass } =
    useCandidates(filters);
  const { t } = useI18n();

  return (
    <main className="container">
      <h1>{t("discover.title")}</h1>
      <CandidateFilter onApply={setFilters} />
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : current ? (
        <>
          <CandidateCard profile={current} />
          <div className="swipe-actions">
            <button className="pass-btn" onClick={pass}>
              {t("discover.pass")}
            </button>
            <button className="like-btn" onClick={like}>
              {t("discover.like")}
            </button>
          </div>
        </>
      ) : (
        <p className="hint">{t("discover.empty")}</p>
      )}

      {matchedWith && (
        <Modal
          onClose={dismissMatch}
          cardClassName="match-modal-card"
          labelledBy="match-modal-title"
        >
          <h2 id="match-modal-title">{t("discover.matchedTitle")}</h2>
          <p>{t("discover.matchedBody", { name: matchedWith })}</p>
          <Link to="/matches" className="like-btn">
            {t("discover.toMessages")}
          </Link>
          <button className="link-btn" onClick={dismissMatch}>
            {t("discover.keepBrowsing")}
          </button>
        </Modal>
      )}
    </main>
  );
}
