import { apiDelete, apiGet, apiPut, apiUpload } from "@/api/client";
import type { Profile, ProfileUpdate } from "../types";

export const getProfile = (): Promise<Profile> => apiGet<Profile>("/api/profile/me");

export const updateProfile = (data: ProfileUpdate): Promise<Profile> =>
  apiPut<ProfileUpdate, Profile>("/api/profile/me", data);

export const uploadAvatar = (file: File): Promise<Profile> =>
  apiUpload<Profile>("/api/profile/me/avatar", file);

export const removeAvatar = (): Promise<Profile> =>
  apiDelete<Profile>("/api/profile/me/avatar");
