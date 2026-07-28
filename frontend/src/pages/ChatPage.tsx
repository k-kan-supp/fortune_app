import { Link, useParams } from "react-router-dom";
import { ChatWindow } from "@/features/matching/components/ChatWindow";

export function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();

  if (!matchId) {
    return (
      <main className="container">
        <p className="error">マッチが指定されていません。</p>
        <Link to="/matches">← マッチ一覧へ</Link>
      </main>
    );
  }

  return (
    <main className="container chat-container">
      <p className="back-link-top">
        <Link to="/matches">← マッチ一覧</Link>
      </p>
      <ChatWindow matchId={matchId} />
    </main>
  );
}
