import { apiFetch } from "./client";
import type { ApiSuccess, ArtistProfile } from "@/lib/types";

export const artistKeys = {
  all: ["artists"] as const,
  detail: (id: string) => ["artists", "detail", id] as const,
};

export async function getArtist(id: string) {
  const res = await apiFetch<ApiSuccess<ArtistProfile>>(
    `/api/v1/artists/${id}`,
  );
  // Normalize includes (accept either casing, expose both).
  const data = res.data;
  return {
    ...res,
    data: {
      ...data,
      songs: data.songs ?? data.Songs ?? [],
      user: data.user ?? data.User,
    },
  };
}

export async function followArtist(id: string) {
  return apiFetch<ApiSuccess<unknown>>(`/api/v1/artists/${id}/follow`, {
    method: "POST",
  });
}
