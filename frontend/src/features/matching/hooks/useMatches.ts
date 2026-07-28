import { useEffect, useState } from "react";
import { getMatches } from "../api/matchingApi";
import type { Match } from "../types";

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMatches()
      .then(setMatches)
      .catch((e) => setError(e instanceof Error ? e.message : "取得に失敗しました。"))
      .finally(() => setLoading(false));
  }, []);

  return { matches, loading, error };
}
