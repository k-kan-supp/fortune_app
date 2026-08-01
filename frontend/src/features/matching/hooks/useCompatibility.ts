import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { errorMessage } from "@/lib/errors";
import { getCompatibility, getMatchCompatibility } from "../api/matchingApi";
import type { Compatibility } from "../types";

interface State {
  result: Compatibility | null;
  /** 取得に失敗した理由。表示するかどうかは呼び出し側が決める。 */
  error: string | null;
}

/** 相手のユーザーIDから相性を取る（候補カードから開くとき）。 */
export function useCompatibility(userId: string): State {
  return useCompatibilityFrom(() => getCompatibility(userId), userId);
}

/** マッチIDから相性を取る（チャットは相手のユーザーIDを持たない）。 */
export function useMatchCompatibility(matchId: string): State {
  return useCompatibilityFrom(() => getMatchCompatibility(matchId), matchId);
}

/**
 * 相性を一度だけ取得する。
 *
 * ``key`` が変わったら取り直し、その間に返ってきた古い応答は捨てる
 * （相手を切り替えた直後に前の相手の相性が出るのを防ぐ）。
 */
function useCompatibilityFrom(load: () => Promise<Compatibility>, key: string): State {
  const [state, setState] = useState<State>({ result: null, error: null });
  const { t } = useI18n();

  useEffect(() => {
    let active = true;
    setState({ result: null, error: null });
    load()
      .then((result) => active && setState({ result, error: null }))
      .catch(
        (e) => active && setState({ result: null, error: errorMessage(e, t("errors.fetch")) }),
      );
    return () => {
      active = false;
    };
    // load は毎回作り直される無名関数なので、取り直しの判定は key で行う
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
