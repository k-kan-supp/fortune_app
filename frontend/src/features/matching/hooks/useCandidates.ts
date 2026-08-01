import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { errorMessage } from "@/lib/errors";
import { getCandidates, sendLike, type CandidateFilters } from "../api/matchingApi";
import type { PublicProfile } from "../types";

/** 候補デッキ。先頭から順に like/pass し、成立したら matchedWith を通知する。 */
export function useCandidates(filters: CandidateFilters) {
  const [deck, setDeck] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchedWith, setMatchedWith] = useState<string | null>(null);
  const { t } = useI18n();

  // filters はオブジェクトなので中身で依存を判定する
  const filterKey = JSON.stringify(filters);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getCandidates(filters)
      .then(setDeck)
      .catch((e) => setError(errorMessage(e, t("errors.fetch"))))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  useEffect(load, [load]);

  const current = deck[0] ?? null;

  async function act(like: boolean) {
    if (!current) return;
    const target = current;
    setDeck((prev) => prev.slice(1)); // 楽観的に次へ
    try {
      const res = await sendLike(target.user_id, like);
      if (res.matched) setMatchedWith(target.display_name ?? t("discover.someone"));
    } catch (e) {
      setError(errorMessage(e, t("errors.send")));
    }
  }

  return {
    current,
    remaining: deck.length,
    loading,
    error,
    matchedWith,
    dismissMatch: () => setMatchedWith(null),
    like: () => act(true),
    pass: () => act(false),
    reload: load,
  };
}
