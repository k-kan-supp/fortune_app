import { useEffect, useState } from "react";
import { getLang, translate } from "@/i18n";
import { getMatches } from "../api/matchingApi";
import type { Match } from "../types";

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMatches()
      .then(setMatches)
      .catch((e) =>
        setError(e instanceof Error ? e.message : translate(getLang(), "errors.fetch")),
      )
      .finally(() => setLoading(false));
  }, []);

  return { matches, loading, error };
}
