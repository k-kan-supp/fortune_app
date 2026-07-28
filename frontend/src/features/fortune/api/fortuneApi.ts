import { apiPost } from "@/api/client";
import type { FortuneRequest, FortuneResponse } from "../types";

export function fetchFortune(req: FortuneRequest): Promise<FortuneResponse> {
  return apiPost<FortuneRequest, FortuneResponse>("/api/fortune", req);
}
