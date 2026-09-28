import { apiFetch } from "./client";
import type { ApiSuccess, Playlist, User } from "@/lib/types";

export const userKeys = {
  all: ["users"] as const,
  me: ["users", "me"] as const,
  profile: (id: string) => ["users", "profile", id] as const,
};

export async function getMe() {
  return apiFetch<ApiSuccess<User>>("/api/v1/users/me");
}

export interface PublicProfile extends User {
  Playlists?: Playlist[];
  playlists?: Playlist[];
}

export async function getPublicProfile(id: string) {
  return apiFetch<ApiSuccess<PublicProfile>>(`/api/v1/users/${id}/profile`);
}
