import { ApiError, apiFetch, buildQuery } from "./client";
import { listSongs } from "./songs";
import type {
  ApiSuccess,
  Song,
  SongListParams,
} from "@/lib/types";

export const discoveryKeys = {
  all: ["discovery"] as const,
  newReleases: (params: SongListParams) =>
    ["discovery", "new-releases", params] as const,
};

export async function getNewReleases(params: SongListParams = {}) {
  const query = buildQuery({
    page: params.page ?? 1,
    size: params.size ?? 10,
    sortBy: params.sortBy ?? "releaseDate",
    orderBy: params.orderBy ?? "desc",
  });
  try {
    return await apiFetch<ApiSuccess<Song[]>>(
      `/api/v1/discovery/new-releases${query}`,
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      // Backend predates the discovery module: fall back to the catalog
      // sorted newest-first so the section still works.
      return listSongs({
        page: params.page,
        size: params.size,
        sortBy: params.sortBy ?? "releaseDate",
        orderBy: params.orderBy ?? "desc",
      });
    }
    throw err;
  }
}
