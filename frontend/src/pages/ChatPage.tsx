import { Link, useParams } from "react-router-dom";
import { ChatMenu } from "@/features/matching/components/ChatMenu";
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
      <div className="chat-header">
        <Link to="/matches">← マッチ一覧</Link>
        <ChatMenu matchId={matchId} />
      </div>
      <ChatWindow matchId={matchId} />
    </main>
  );
}
