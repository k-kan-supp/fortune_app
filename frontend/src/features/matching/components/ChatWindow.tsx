import { useEffect, useRef, useState, type FormEvent } from "react";
import { useChat } from "../hooks/useChat";

/** マッチ内のチャットUI（メッセージ一覧 + 入力）。 */
export function ChatWindow({ matchId }: { matchId: string }) {
  const { messages, error, connected, send } = useChat(matchId);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // 新着が来たら最下部へスクロール
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(text);
    setText("");
  }

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={`bubble ${m.is_mine ? "bubble--mine" : "bubble--theirs"}`}>
            {m.body}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          placeholder={connected ? "メッセージを入力" : "接続中…"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={!connected || !text.trim()}>
          送信
        </button>
      </form>
    </div>
  );
}
