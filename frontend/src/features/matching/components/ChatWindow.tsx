import { useEffect, useRef, useState, type FormEvent } from "react";
import { useChat } from "../hooks/useChat";

const TYPING_STOP_MS = 2000;

/** マッチ内のチャットUI（メッセージ一覧 + 入力 + 入力中表示）。 */
export function ChatWindow({ matchId }: { matchId: string }) {
  const { messages, error, connected, othersTyping, send, setTyping } = useChat(matchId);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef(false);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 新着・入力中表示が変わったら最下部へスクロール
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, othersTyping]);

  useEffect(() => {
    return () => {
      if (stopTimer.current) clearTimeout(stopTimer.current);
    };
  }, []);

  function stopTyping() {
    if (typingRef.current) {
      typingRef.current = false;
      setTyping(false);
    }
  }

  function handleChange(value: string) {
    setText(value);
    if (!typingRef.current) {
      typingRef.current = true;
      setTyping(true);
    }
    // 一定時間入力が止まったら「入力中」を解除
    if (stopTimer.current) clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(stopTyping, TYPING_STOP_MS);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(text);
    setText("");
    stopTyping();
  }

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={`bubble ${m.is_mine ? "bubble--mine" : "bubble--theirs"}`}>
            {m.body}
          </div>
        ))}
        {othersTyping && (
          <div className="bubble bubble--theirs typing-bubble">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          placeholder={connected ? "メッセージを入力" : "接続中…"}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
        />
        <button type="submit" disabled={!connected || !text.trim()}>
          送信
        </button>
      </form>
    </div>
  );
}
