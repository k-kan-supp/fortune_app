import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import type { Match } from "../types";

/** マッチ一覧。各行がチャット画面へのリンクになる。 */
export function MatchList({ matches }: { matches: Match[] }) {
  const { t } = useI18n();

  if (matches.length === 0) {
    return <p className="hint">{t("matches.empty")}</p>;
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
              <span className="match-name">
                {m.user.display_name ?? t("common.unnamed")}
              </span>
              <span className="match-last">
                {m.last_message
                  ? `${m.last_message.is_mine ? t("matches.mine") : ""}${
                      m.last_message.image_url ? t("matches.image") : m.last_message.body
                    }`
                  : t("matches.noMessages")}
              </span>
            </div>
            {m.unread_count > 0 && <span className="badge">{m.unread_count}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
