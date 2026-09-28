import { apiFetch, buildQuery } from "./client";
import type {
  ApiSuccess,
  SharePayload,
  Song,
  SongListParams,
} from "@/lib/types";

export const songKeys = {
  all: ["songs"] as const,
  list: (params: SongListParams) => ["songs", "list", params] as const,
  search: (params: SongListParams) => ["songs", "search", params] as const,
  detail: (id: string) => ["songs", "detail", id] as const,
};

export async function listSongs(params: SongListParams = {}) {
  const query = buildQuery({
    page: params.page ?? 1,
    size: params.size ?? 20,
    sortBy: params.sortBy ?? "releaseDate",
    orderBy: params.orderBy ?? "desc",
  });
  return apiFetch<ApiSuccess<Song[]>>(`/api/v1/songs/${query}`);
}

export async function searchSongs(params: SongListParams = {}) {
  const query = buildQuery({
    q: params.q,
    title: params.title,
    album: params.album,
    genre: params.genre,
    page: params.page ?? 1,
    size: params.size ?? 20,
    sortBy: params.sortBy ?? "releaseDate",
    orderBy: params.orderBy ?? "desc",
  });
  return apiFetch<ApiSuccess<Song[]>>(`/api/v1/songs/search${query}`);
}

export async function getSong(id: string) {
  return apiFetch<ApiSuccess<Song>>(`/api/v1/songs/${id}`);
}

export async function shareSong(id: string) {
  return apiFetch<ApiSuccess<SharePayload>>(`/api/v1/songs/${id}/share`, {
    method: "POST",
  });
}
