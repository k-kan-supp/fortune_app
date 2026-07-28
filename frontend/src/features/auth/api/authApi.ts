import { apiPost } from "@/api/client";
import type { AuthResult, MessageResponse } from "../types";

/** メールアドレスに登録用リンクを送るようリクエストする。 */
export function requestMagicLink(email: string): Promise<MessageResponse> {
  return apiPost<{ email: string }, MessageResponse>("/api/auth/magic-link", { email });
}

/** メールURL内のトークンを検証し、ログインセッションを取得する。 */
export function verifyMagicLink(token: string): Promise<AuthResult> {
  return apiPost<{ token: string }, AuthResult>("/api/auth/verify", { token });
}
