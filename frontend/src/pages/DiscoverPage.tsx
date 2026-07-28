import { useState } from "react";
import { Link } from "react-router-dom";
import type { CandidateFilters } from "@/features/matching/api/matchingApi";
import { CandidateCard } from "@/features/matching/components/CandidateCard";
import { CandidateFilter } from "@/features/matching/components/CandidateFilter";
import { useCandidates } from "@/features/matching/hooks/useCandidates";

export function DiscoverPage() {
  const [filters, setFilters] = useState<CandidateFilters>({});
  const { current, loading, error, matchedWith, dismissMatch, like, pass } =
    useCandidates(filters);

  return (
    <main className="container">
      <h1>さがす</h1>
      <CandidateFilter onApply={setFilters} />
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>読み込み中…</p>
      ) : current ? (
        <>
          <CandidateCard profile={current} />
          <div className="swipe-actions">
            <button className="pass-btn" onClick={pass}>
              スキップ
            </button>
            <button className="like-btn" onClick={like}>
              いいね
            </button>
          </div>
        </>
      ) : (
        <p className="hint">条件に合う候補がいません。絞り込みを変えてみてください。</p>
      )}

      {matchedWith && (
        <div className="match-modal" onClick={dismissMatch}>
          <div className="match-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>マッチしました 🎉</h2>
            <p>{matchedWith} さんとマッチしました。</p>
            <Link to="/matches" className="like-btn">
              メッセージを送る
            </Link>
            <button className="link-btn" onClick={dismissMatch}>
              続けてさがす
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
