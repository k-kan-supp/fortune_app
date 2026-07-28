import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlocked, unblockUser } from "@/features/matching/api/matchingApi";
import type { PublicProfile } from "@/features/matching/types";

export function BlockedPage() {
  const [users, setUsers] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBlocked()
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : "取得に失敗しました。"))
      .finally(() => setLoading(false));
  }, []);

  async function unblock(userId: string) {
    try {
      await unblockUser(userId);
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    } catch {
      setError("解除に失敗しました。");
    }
  }

  return (
    <main className="container">
      <h1>ブロックしたユーザー</h1>
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>読み込み中…</p>
      ) : users.length === 0 ? (
        <p className="hint">ブロック中のユーザーはいません。</p>
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
                <span className="match-name">{u.display_name ?? "名称未設定"}</span>
              </div>
              <button className="pass-btn" onClick={() => unblock(u.user_id)}>
                解除
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="back-link">
        <Link to="/profile">← 設定へ戻る</Link>
      </p>
    </main>
  );
}
