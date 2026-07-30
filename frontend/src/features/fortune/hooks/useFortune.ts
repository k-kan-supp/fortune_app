import { useState } from "react";
import { useI18n } from "@/i18n";
import { fetchFortune } from "../api/fortuneApi";
import type { FortuneRequest, FortuneResponse } from "../types";

/** 鑑定リクエストの状態（ローディング・結果・エラー）を管理するフック。 */
export function useFortune() {
  const [result, setResult] = useState<FortuneResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  async function submit(req: FortuneRequest) {
    setLoading(true);
    setError(null);
    try {
      setResult(await fetchFortune(req));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errors.unknown"));
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, submit };
}
