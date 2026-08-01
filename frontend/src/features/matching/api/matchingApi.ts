import { apiDelete, apiGet, apiPost, apiUpload } from "@/api/client";
import type {
  Compatibility,
  LikeResult,
  Match,
  Message,
  PublicProfile,
} from "../types";

export interface CandidateFilters {
  gender?: string;
  min_age?: number;
  max_age?: number;
  prefecture?: string;
}

export const getCandidates = (f: CandidateFilters = {}): Promise<PublicProfile[]> => {
  const q = new URLSearchParams();
  if (f.gender) q.set("gender", f.gender);
  if (f.min_age != null) q.set("min_age", String(f.min_age));
  if (f.max_age != null) q.set("max_age", String(f.max_age));
  if (f.prefecture) q.set("prefecture", f.prefecture);
  const qs = q.toString();
  return apiGet<PublicProfile[]>(`/api/matching/candidates${qs ? `?${qs}` : ""}`);
};

export const sendLike = (targetUserId: string, like: boolean): Promise<LikeResult> =>
  apiPost<{ target_user_id: string; like: boolean }, LikeResult>("/api/matching/likes", {
    target_user_id: targetUserId,
    like,
  });

export const getCompatibility = (userId: string): Promise<Compatibility> =>
  apiGet<Compatibility>(`/api/matching/compatibility/${userId}`);

export const getMatches = (): Promise<Match[]> =>
  apiGet<Match[]>("/api/matching/matches");

export const getMessages = (matchId: string): Promise<Message[]> =>
  apiGet<Message[]>(`/api/matching/matches/${matchId}/messages`);

export const postMessage = (matchId: string, body: string): Promise<Message> =>
  apiPost<{ body: string }, Message>(`/api/matching/matches/${matchId}/messages`, { body });

export const uploadChatImage = (matchId: string, file: File): Promise<Message> =>
  apiUpload<Message>(`/api/matching/matches/${matchId}/images`, file, "POST");

export const markRead = (matchId: string): Promise<void> =>
  apiPost<Record<string, never>, void>(`/api/matching/matches/${matchId}/read`, {});

export const getUnreadCount = (): Promise<{ count: number }> =>
  apiGet<{ count: number }>("/api/matching/unread-count");

export const blockInMatch = (matchId: string): Promise<void> =>
  apiPost<Record<string, never>, void>(`/api/matching/matches/${matchId}/block`, {});

export const reportInMatch = (matchId: string, reason: string): Promise<void> =>
  apiPost<{ reason: string }, void>(`/api/matching/matches/${matchId}/report`, { reason });

export const getBlocked = (): Promise<PublicProfile[]> =>
  apiGet<PublicProfile[]>("/api/matching/blocks");

export const unblockUser = (userId: string): Promise<void> =>
  apiDelete<void>(`/api/matching/blocks/${userId}`);
