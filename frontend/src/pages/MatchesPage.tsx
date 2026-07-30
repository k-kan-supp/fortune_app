import { MatchList } from "@/features/matching/components/MatchList";
import { useMatches } from "@/features/matching/hooks/useMatches";
import { useI18n } from "@/i18n";

export function MatchesPage() {
  const { matches, loading, error } = useMatches();
  const { t } = useI18n();

  return (
    <main className="container">
      <h1>{t("matches.title")}</h1>
      {error && <p className="error">{error}</p>}
      {loading ? <p>{t("common.loading")}</p> : <MatchList matches={matches} />}
    </main>
  );
}
