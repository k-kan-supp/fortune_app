import { useState } from "react";
import { Link } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import type { CandidateFilters } from "@/features/matching/api/matchingApi";
import { CandidateCard } from "@/features/matching/components/CandidateCard";
import { CandidateFilter } from "@/features/matching/components/CandidateFilter";
import { CompatibilityModal } from "@/features/matching/components/CompatibilityModal";
import { useCandidates } from "@/features/matching/hooks/useCandidates";
import { useProfileSummary } from "@/features/profile/hooks/useProfileSummary";
import { useI18n } from "@/i18n";

export function DiscoverPage() {
  const [filters, setFilters] = useState<CandidateFilters>({});
  const { current, loading, error, matchedWith, dismissMatch, like, pass } =
    useCandidates(filters);
  // カードをタップすると、その相手との相性を出す
  const [compatOpen, setCompatOpen] = useState(false);
  const { fortuneQuery } = useProfileSummary();
  const { t } = useI18n();
  const filtered = Object.values(filters).some((v) => v !== undefined && v !== "");
  // 絞り込みパネルは自前の入力状態を持つので、外から解除するときは作り直して揃える
  const [filterKey, setFilterKey] = useState(0);

  function clearFilters() {
    setFilters({});
    setFilterKey((n) => n + 1);
  }

  return (
    <main className="container">
      <h1>{t("discover.title")}</h1>
      <CandidateFilter key={filterKey} onApply={setFilters} />
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : current ? (
        <>
          <button
            type="button"
            className="candidate-tap"
            onClick={() => setCompatOpen(true)}
            aria-label={t("compat.open")}
          >
            <CandidateCard profile={current} />
            <span className="candidate-tap-hint">{t("compat.hint")}</span>
          </button>
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
        /* 候補切れを行き止まりにしない。相手がいない時間にも読むものを置く。 */
        <section className="discover-empty">
          <h2>{t("discover.emptyTitle")}</h2>
          <p className="hint">
            {filtered ? t("discover.emptyFiltered") : t("discover.empty")}
          </p>
          <div className="discover-empty-actions">
            {filtered && (
              <button type="button" className="like-btn" onClick={clearFilters}>
                {t("discover.clearFilters")}
              </button>
            )}
            {fortuneQuery && (
              <Link
                to={`/result?${fortuneQuery}`}
                className={filtered ? "link-btn" : "like-btn"}
              >
                {t("discover.readOwn")}
              </Link>
            )}
          </div>
          <p className="discover-empty-note">{t("discover.emptyNote")}</p>
        </section>
      )}

      {compatOpen && current && (
        <CompatibilityModal
          userId={current.user_id}
          name={current.display_name ?? t("common.unnamed")}
          onClose={() => setCompatOpen(false)}
        />
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
