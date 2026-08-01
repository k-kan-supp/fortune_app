import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlocked, unblockUser } from "@/features/matching/api/matchingApi";
import type { PublicProfile } from "@/features/matching/types";
import { useI18n } from "@/i18n";
import { errorMessage } from "@/lib/errors";

export function BlockedPage() {
  const [users, setUsers] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    getBlocked()
      .then(setUsers)
      .catch((e) => setError(errorMessage(e, t("errors.fetch"))))
      .finally(() => setLoading(false));
    // 言語切り替えで再取得はしない（初回のみ）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function unblock(userId: string) {
    try {
      await unblockUser(userId);
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    } catch {
      setError(t("blocked.unblockFailed"));
    }
  }

  return (
    <main className="container">
      <h1>{t("blocked.title")}</h1>
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : users.length === 0 ? (
        <p className="hint">{t("blocked.empty")}</p>
      ) : (
        <ul className="match-list">
          {users.map((u) => (
            <li key={u.user_id} className="match-row">
              {u.avatar_url ? (
                <img src={u.avatar_url} alt="" className="match-avatar" />
              ) : (
                <div className="match-avatar match-avatar--empty" />
              )}
              <div className="match-info">
                <span className="match-name">{u.display_name ?? t("common.unnamed")}</span>
              </div>
              <button className="pass-btn" onClick={() => unblock(u.user_id)}>
                {t("blocked.unblock")}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="back-link">
        <Link to="/profile">{t("blocked.back")}</Link>
      </p>
    </main>
  );
}
