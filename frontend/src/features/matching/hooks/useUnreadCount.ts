import { useEffect, useState } from "react";
import { getUnreadCount } from "../api/matchingApi";

const POLL_INTERVAL_MS = 20000;

/** 全マッチ合計の未読件数を定期取得する（ナビのバッジ用）。 */
export function useUnreadCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchCount = () =>
      getUnreadCount()
        .then((r) => active && setCount(r.count))
        .catch(() => {});

    fetchCount();
    const timer = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return count;
}
