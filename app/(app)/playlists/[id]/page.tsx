"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ListMusic,
  Loader2,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPlaylist,
  playlistKeys,
  removeSongFromPlaylist,
  addSongToPlaylist,
} from "@/lib/api/playlists";
import { searchSongs, songKeys } from "@/lib/api/songs";
import { ApiError } from "@/lib/api/client";
import type { Song } from "@/lib/types";
import { formatDate, formatDuration, formatDurationShort } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";
import { Artwork } from "@/components/Artwork";
import { SongRow } from "@/components/cards/SongRow";
import {
  DeletePlaylistDialog,
  EditPlaylistDialog,
} from "@/components/modals/PlaylistDialogs";
import { EmptyState, ErrorState, SongRowSkeleton } from "@/components/states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const playQueue = usePlayerStore((s) => s.playQueue);
  const current = usePlayerStore((s) => s.current);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const toggle = usePlayerStore((s) => s.toggle);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const playlistQuery = useQuery({
    queryKey: playlistKeys.detail(id),
    queryFn: () => getPlaylist(id),
  });

  const playlist = playlistQuery.data?.data;
  // getPlaylist() normalizes the backend's lowercase `songs` key.
  const songs = playlist?.songs ?? [];
  // NOTE: the backend does not enforce playlist ownership — any signed-in
  // user may add/remove/rename/delete, so the UI gates nothing here.
  const isPlayingThis =
    isPlaying && current && songs.some((s) => s.id === current.id);
  const totalMs = songs.reduce((sum, s) => sum + (s.durationMs ?? 0), 0);

  const removeMutation = useMutation({
    mutationFn: (songId: string) => removeSongFromPlaylist(id, songId),
    onSuccess: (_, songId) => {
      toast.success("Removed from playlist");
      queryClient.setQueryData(playlistKeys.detail(id), (old: unknown) => {
        if (!old || typeof old !== "object" || !("data" in old)) return old;
        const envelope = old as { data: { songs?: Song[] } };
        return {
          ...envelope,
          data: {
            ...envelope.data,
            songs: (envelope.data.songs ?? []).filter((s) => s.id !== songId),
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: playlistKeys.list });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Could not remove song");
      playlistQuery.refetch();
    },
  });

  if (playlistQuery.isLoading) {
    return (
      <div className="space-y-8 py-4">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
          <Skeleton className="h-52 w-52 rounded-3xl" />
          <div className="flex-1 space-y-3 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (playlistQuery.isError) {
    const err = playlistQuery.error;
    if (err instanceof ApiError && err.isNotFound) {
      return (
        <div className="py-10">
          <EmptyState
            icon={<ListMusic className="h-5 w-5" />}
            title="Playlist not found"
            description="It may have been deleted, or the link is wrong."
          />
        </div>
      );
    }
    return (
      <div className="py-10">
        <ErrorState onRetry={() => playlistQuery.refetch()} />
      </div>
    );
  }

  if (!playlist) return null;

  const creator = playlist.user?.username ?? playlist.User?.username;

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <Artwork
          seed={playlist.id}
          title={playlist.name}
          className="h-52 w-52 shadow-2xl shadow-black/50"
          rounded="rounded-3xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Playlist
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-white sm:text-5xl">
            {playlist.name}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {creator ? `By ${creator} · ` : ""}
            {songs.length} song{songs.length === 1 ? "" : "s"}
            {songs.length > 0 ? ` · ${formatDurationShort(totalMs)}` : ""}
            {playlist.createdAt
              ? ` · Created ${formatDate(playlist.createdAt)}`
              : ""}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {songs.length > 0 && (
              <Button
                size="lg"
                onClick={() => {
                  if (current && songs.some((s) => s.id === current.id)) toggle();
                  else playQueue(songs, 0);
                }}
              >
                {isPlayingThis ? (
                  <Pause className="fill-current" />
                ) : (
                  <Play className="fill-current" />
                )}
                {isPlayingThis ? "Pause" : "Play"}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setAddOpen(true)}>
              <Plus /> Add songs
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" aria-label="Playlist options">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="text-red-400 focus:text-red-300"
                >
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {songs.length === 0 ? (
        <EmptyState
          icon={<ListMusic className="h-5 w-5" />}
          title="No songs in here yet"
          description="Add songs from any song's ••• menu, or use the Add songs button."
          action={
            <Button onClick={() => setAddOpen(true)} className="mt-2">
              <Plus /> Add songs
            </Button>
          }
        />
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-2">
          {songs.map((song, i) => (
            <div key={`${song.id ?? "song"}-${i}`} className="group/row relative">
              <SongRow song={song} index={i} context={songs} showGenre />
              <button
                onClick={() => removeMutation.mutate(song.id)}
                disabled={removeMutation.isPending}
                aria-label={`Remove ${song.title}`}
                title="Remove from playlist"
                className="absolute right-12 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-2 text-zinc-600 opacity-0 transition-all hover:bg-red-500/15 hover:text-red-400 group-hover/row:opacity-100 disabled:opacity-50"
              >
                {removeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <EditPlaylistDialog
        playlist={playlist}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeletePlaylistDialog
        playlist={playlist}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => router.push("/library")}
      />
      <AddSongsDialog
        playlistId={id}
        existingIds={new Set(songs.map((s) => s.id))}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
    </div>
  );
}

function AddSongsDialog({
  playlistId,
  existingIds,
  open,
  onOpenChange,
}: {
  playlistId: string;
  existingIds: Set<string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const searchQuery = useQuery({
    queryKey: songKeys.search({ q: debounced }),
    queryFn: () => searchSongs({ q: debounced, size: 10 }),
    enabled: open && debounced.trim().length >= 2,
  });

  const results = searchQuery.data?.data ?? [];

  const addMutation = useMutation({
    mutationFn: (songId: string) => addSongToPlaylist(playlistId, songId),
    onSuccess: (_res, songId) => {
      toast.success("Added to playlist");
      existingIds.add(songId);
      queryClient.invalidateQueries({
        queryKey: playlistKeys.detail(playlistId),
      });
      queryClient.invalidateQueries({ queryKey: playlistKeys.list });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Could not add song");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add songs</DialogTitle>
          <DialogDescription>
            Search the catalog and tap + to add. Songs already in the playlist
            are marked.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs…"
            className="pl-10"
          />
        </div>
        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
          {searchQuery.isLoading && (
            <>
              <SongRowSkeleton />
              <SongRowSkeleton />
            </>
          )}
          {debounced.trim().length >= 2 &&
            searchQuery.data &&
            results.length === 0 && (
              <p className="py-6 text-center text-sm text-zinc-500">
                No results for “{debounced.trim()}”.
              </p>
            )}
          {debounced.trim().length < 2 && (
            <p className="py-6 text-center text-sm text-zinc-500">
              Type at least 2 characters to search.
            </p>
          )}
          {results.map((song, i) => {
            const exists = existingIds.has(song.id);
            return (
              <div
                key={`${song.id ?? "song"}-${i}`}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/[0.05]"
              >
                <Artwork seed={song.id} title={song.title} className="h-10 w-10" rounded="rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {song.title}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {song.albumName ? `${song.albumName} · ` : ""}{formatDuration(song.durationMs)}
                  </p>
                </div>
                <button
                  disabled={exists || addMutation.isPending}
                  onClick={() => addMutation.mutate(song.id)}
                  className="cursor-pointer rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-accent hover:text-black disabled:cursor-default disabled:opacity-40 disabled:hover:bg-white/10 disabled:hover:text-white"
                >
                  {exists ? "Added" : "Add"}
                </button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
