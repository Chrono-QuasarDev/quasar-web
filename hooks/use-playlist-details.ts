import { useQueries } from "@tanstack/react-query";
import { getPlaylist, playlistKeys } from "@/lib/api/playlists";
import type { Playlist } from "@/lib/types";

// The list endpoint returns bare rows ({id, userId, name}) with no songs, so
// hydrate each visible playlist from its (shared, cached) detail query. This
// also pre-warms the detail page cache — opening a playlist is instant.
export function usePlaylistDetails(playlists: Playlist[]): Playlist[] {
  const details = useQueries({
    queries: playlists.map((p) => ({
      queryKey: playlistKeys.detail(p.id),
      queryFn: () => getPlaylist(p.id),
      staleTime: 30_000,
    })),
  });
  return playlists.map((p, i) => details[i]?.data?.data ?? p);
}
