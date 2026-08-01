import { useState, type FormEvent } from "react";
import { useI18n } from "@/i18n";
import { errorMessage } from "@/lib/errors";
import { requestMagicLink } from "../api/authApi";

type Status = "idle" | "sending" | "sent" | "error";

/** メールアドレスを入力し、登録用リンクの送信をリクエストするフォーム。 */
export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const { t } = useI18n();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      // 完了メッセージはサーバが Accept-Language に合わせて返す
      const res = await requestMagicLink(email);
      setMessage(res.message);
      setStatus("sent");
    } catch (err) {
      setMessage(errorMessage(err, t("errors.send")));
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="auth-card">
        <p>{message}</p>
        <p className="hint">{t("register.sentHint")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-card">
      <h1>{t("register.title")}</h1>
      <p className="hint">{t("register.hint")}</p>
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? t("register.sending") : t("register.submit")}
      </button>
      {status === "error" && <p className="error">{message}</p>}
    </form>
  );
}
