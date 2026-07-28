import { useEffect, useRef, useState } from "react";
import { verifyMagicLink } from "../api/authApi";
import { saveToken } from "../authStorage";
import type { User } from "../types";

type Status = "verifying" | "success" | "error";

/** URL のトークンを検証し、成功したらセッションを保存するフック。 */
export function useVerify(token: string | null) {
  const [status, setStatus] = useState<Status>("verifying");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const done = useRef(false); // StrictMode の二重実行対策

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    if (!token) {
      setStatus("error");
      setError("トークンがありません。");
      return;
    }

    verifyMagicLink(token)
      .then((res) => {
        saveToken(res.access_token);
        setUser(res.user);
        setStatus("success");
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "検証に失敗しました。");
        setStatus("error");
      });
  }, [token]);

  return { status, user, error };
}
