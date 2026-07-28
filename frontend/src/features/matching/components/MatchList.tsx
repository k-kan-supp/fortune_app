import { Link } from "react-router-dom";
import type { Match } from "../types";

/** マッチ一覧。各行がチャット画面へのリンクになる。 */
export function MatchList({ matches }: { matches: Match[] }) {
  if (matches.length === 0) {
    return <p className="hint">まだマッチはありません。「さがす」からいいねしてみましょう。</p>;
  }

  return (
    <ul className="match-list">
      {matches.map((m) => (
        <li key={m.match_id}>
          <Link to={`/chat/${m.match_id}`} className="match-row">
            {m.user.avatar_url ? (
              <img src={m.user.avatar_url} alt="" className="match-avatar" />
            ) : (
              <div className="match-avatar match-avatar--empty" />
            )}
            <div className="match-info">
              <span className="match-name">{m.user.display_name ?? "名称未設定"}</span>
              <span className="match-last">
                {m.last_message
                  ? `${m.last_message.is_mine ? "自分: " : ""}${m.last_message.body}`
                  : "メッセージを送ってみましょう"}
              </span>
            </div>
            {m.unread_count > 0 && <span className="badge">{m.unread_count}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
