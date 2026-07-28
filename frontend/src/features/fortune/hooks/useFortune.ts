import { useState } from "react";
import { fetchFortune } from "../api/fortuneApi";
import type { FortuneRequest, FortuneResponse } from "../types";

/** 鑑定リクエストの状態（ローディング・結果・エラー）を管理するフック。 */
export function useFortune() {
  const [result, setResult] = useState<FortuneResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(req: FortuneRequest) {
    setLoading(true);
    setError(null);
    try {
      setResult(await fetchFortune(req));
    } catch (e) {
      setError(e instanceof Error ? e.message : "不明なエラー");
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, submit };
}
