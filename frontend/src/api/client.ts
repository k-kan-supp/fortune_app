import { getToken } from "@/features/auth/authStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return handle<TRes>(res);
}

export const apiGet = <TRes>(path: string): Promise<TRes> =>
  fetch(`${BASE_URL}${path}`, { headers: authHeaders() }).then(handle<TRes>);

export const apiPost = <TReq, TRes>(path: string, body: TReq): Promise<TRes> =>
  jsonRequest<TReq, TRes>("POST", path, body);

export const apiPut = <TReq, TRes>(path: string, body: TReq): Promise<TRes> =>
  jsonRequest<TReq, TRes>("PUT", path, body);

export const apiDelete = <TRes>(path: string): Promise<TRes> =>
  jsonRequest<never, TRes>("DELETE", path);

/** multipart/form-data でファイルを送る（Content-Type はブラウザが自動設定）。 */
export async function apiUpload<TRes>(path: string, file: File): Promise<TRes> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: authHeaders(),
    body: form,
  });
  return handle<TRes>(res);
}
