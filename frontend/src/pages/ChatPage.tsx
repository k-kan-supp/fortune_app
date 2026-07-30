import { Link, useParams } from "react-router-dom";
import { ChatMenu } from "@/features/matching/components/ChatMenu";
import { ChatWindow } from "@/features/matching/components/ChatWindow";
import { useI18n } from "@/i18n";

export function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { t } = useI18n();

  if (!matchId) {
    return (
      <main className="container">
        <p className="error">{t("chat.noMatch")}</p>
        <Link to="/matches">{t("chat.backToList")}</Link>
      </main>
    );
  }

  return (
    <main className="container chat-container">
      <div className="chat-header">
        <Link to="/matches">{t("chat.back")}</Link>
        <ChatMenu matchId={matchId} />
      </div>
      <ChatWindow matchId={matchId} />
    </main>
  );
}
