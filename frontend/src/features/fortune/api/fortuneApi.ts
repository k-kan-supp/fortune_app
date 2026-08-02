import { apiGet, apiPost } from "@/api/client";
import type { FortuneRequest, FortuneResponse, SpeciesCompat } from "../types";

export function fetchFortune(req: FortuneRequest): Promise<FortuneResponse> {
  return apiPost<FortuneRequest, FortuneResponse>("/api/fortune", req);
}

/** 25 種族どうしの相性マップ。命式によらず一定なので、鑑定とは別に取りに行く。 */
export function fetchSpeciesCompat(): Promise<SpeciesCompat> {
  return apiGet<SpeciesCompat>("/api/species/compatibility");
}
