import { getToken } from "@/features/auth/authStorage";
import { getLang } from "@/i18n";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/** 認証トークンと、サーバのメッセージを翻訳させる Accept-Language を付ける。 */
function commonHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Accept-Language": getLang(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    // FastAPI のエラーは {detail: "..."} 形式。取り出せれば使う。
    let detail = `${res.status}`;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch {
      /* ボディが JSON でない場合は無視 */
    }
    throw new Error(detail);
  }
  // 204 No Content 等、ボディが無いレスポンスは JSON 解釈しない
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

async function jsonRequest<TReq, TRes>(
  method: string,
  path: string,
  body?: TReq,
): Promise<TRes> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...commonHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return handle<TRes>(res);
}

export const apiGet = <TRes>(path: string): Promise<TRes> =>
  fetch(`${BASE_URL}${path}`, { headers: commonHeaders() }).then(handle<TRes>);

export const apiPost = <TReq, TRes>(path: string, body: TReq): Promise<TRes> =>
  jsonRequest<TReq, TRes>("POST", path, body);

export const apiPut = <TReq, TRes>(path: string, body: TReq): Promise<TRes> =>
  jsonRequest<TReq, TRes>("PUT", path, body);

export const apiDelete = <TRes>(path: string): Promise<TRes> =>
  jsonRequest<never, TRes>("DELETE", path);

/** multipart/form-data でファイルを送る（Content-Type はブラウザが自動設定）。 */
export async function apiUpload<TRes>(
  path: string,
  file: File,
  method: "PUT" | "POST" = "PUT",
): Promise<TRes> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: commonHeaders(),
    body: form,
  });
  return handle<TRes>(res);
}
