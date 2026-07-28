import { useEffect, useRef, useState, type FormEvent } from "react";
import { uploadChatImage } from "../api/matchingApi";
import { useChat } from "../hooks/useChat";

const TYPING_STOP_MS = 2000;

/** マッチ内のチャットUI（メッセージ一覧 + テキスト/画像入力 + 入力中表示）。 */
export function ChatWindow({ matchId }: { matchId: string }) {
  const { messages, error, connected, othersTyping, send, setTyping } = useChat(matchId);
  const [text, setText] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
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
    if (stopTimer.current) clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(stopTyping, TYPING_STOP_MS);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send(text);
    setText("");
    stopTyping();
  }

  async function handleImage(file: File) {
    setUploadError(null);
    setUploading(true);
    try {
      // 送信分は WebSocket の配信（echo）で反映されるため、ここでは追加しない
      await uploadChatImage(matchId, file);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "画像の送信に失敗しました。");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={`bubble ${m.is_mine ? "bubble--mine" : "bubble--theirs"}`}>
            {m.image_url ? (
              <a href={m.image_url} target="_blank" rel="noreferrer">
                <img src={m.image_url} alt="" className="chat-image" />
              </a>
            ) : (
              m.body
            )}
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

      {(error || uploadError) && <p className="error">{error ?? uploadError}</p>}

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImage(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          className="image-btn"
          onClick={() => fileRef.current?.click()}
          disabled={!connected || uploading}
          aria-label="画像を送る"
        >
          {uploading ? "…" : "＋"}
        </button>
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
