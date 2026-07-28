import { useState, type FormEvent } from "react";
import { requestMagicLink } from "../api/authApi";

type Status = "idle" | "sending" | "sent" | "error";

/** メールアドレスを入力し、登録用リンクの送信をリクエストするフォーム。 */
export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await requestMagicLink(email);
      setMessage(res.message);
      setStatus("sent");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "送信に失敗しました。");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="auth-card">
        <p>{message}</p>
        <p className="hint">
          メールが届かない場合は、迷惑メールフォルダをご確認ください。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-card">
      <h1>ユーザー登録</h1>
      <p className="hint">メールアドレスに登録用リンクをお送りします。</p>
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "送信中…" : "登録用リンクを送る"}
      </button>
      {status === "error" && <p className="error">{message}</p>}
    </form>
  );
}
