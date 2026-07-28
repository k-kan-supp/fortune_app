import { MatchList } from "@/features/matching/components/MatchList";
import { useMatches } from "@/features/matching/hooks/useMatches";

export function MatchesPage() {
  const { matches, loading, error } = useMatches();

  return (
    <main className="container">
      <h1>マッチ</h1>
      {error && <p className="error">{error}</p>}
      {loading ? <p>読み込み中…</p> : <MatchList matches={matches} />}
    </main>
  );
}
