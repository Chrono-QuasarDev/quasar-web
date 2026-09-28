import { apiFetch } from "./client";
import type { ApiSuccess, Playlist, PlaylistSong } from "@/lib/types";

export const playlistKeys = {
  all: ["playlists"] as const,
  list: ["playlists", "list"] as const,
  detail: (id: string) => ["playlists", "detail", id] as const,
};

export async function listPlaylists() {
  return apiFetch<ApiSuccess<Playlist[]>>("/api/v1/playlists/");
}

export async function getPlaylist(id: string) {
  const res = await apiFetch<ApiSuccess<Playlist>>(
    `/api/v1/playlists/${id}`,
  );
  // The playlist module returns songs under lowercase `songs`; normalize so
  // every consumer (and the cache) reads one key.
  return {
    ...res,
    data: { ...res.data, songs: res.data.songs ?? res.data.Songs ?? [] },
  };
}

export async function createPlaylist(name: string) {
  return apiFetch<ApiSuccess<Playlist>>("/api/v1/playlists/", {
    method: "POST",
    body: { name },
  });
}

export async function updatePlaylist(id: string, name: string) {
  return apiFetch<ApiSuccess<Playlist>>(`/api/v1/playlists/${id}`, {
    method: "PUT",
    body: { name },
  });
}

export async function deletePlaylist(id: string) {
  return apiFetch<ApiSuccess<Playlist>>(`/api/v1/playlists/${id}`, {
    method: "DELETE",
  });
}

export async function addSongToPlaylist(playlistId: string, songId: string) {
  return apiFetch<ApiSuccess<PlaylistSong>>(
    `/api/v1/playlists/${playlistId}/songs`,
    { method: "POST", body: { songId } },
  );
}

export async function removeSongFromPlaylist(
  playlistId: string,
  songId: string,
) {
  return apiFetch<ApiSuccess<PlaylistSong>>(
    `/api/v1/playlists/${playlistId}/songs/${songId}`,
    { method: "DELETE" },
  );
}
