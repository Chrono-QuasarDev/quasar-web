"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutGrid,
  List,
  ListMusic,
  MoreHorizontal,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { listPlaylists, playlistKeys } from "@/lib/api/playlists";
import { API_URL, ApiError } from "@/lib/api/client";
import type { Playlist } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { usePlaylistDetails } from "@/hooks/use-playlist-details";
import { usePlayerStore } from "@/stores/player-store";
import { Artwork } from "@/components/Artwork";
import { PlaylistCard } from "@/components/cards/PlaylistCard";
import {
  CreatePlaylistDialog,
  DeletePlaylistDialog,
  EditPlaylistDialog,
} from "@/components/modals/PlaylistDialogs";
import {
  ApiDownBanner,
  EmptyState,
  ErrorState,
  RailSkeleton,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function LibraryPage() {
  const router = useRouter();
  const playQueue = usePlayerStore((s) => s.playQueue);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Playlist | null>(null);
  const [deleting, setDeleting] = useState<Playlist | null>(null);

  const playlistsQuery = useQuery({
    queryKey: playlistKeys.list,
    queryFn: listPlaylists,
  });

  const playlists = playlistsQuery.data?.data ?? [];
  // List rows carry no songs — hydrate from cached detail queries so counts
  // and play buttons are real.
  const hydrated = usePlaylistDetails(playlists);
  const apiDown =
    playlistsQuery.isError &&
    playlistsQuery.error instanceof ApiError &&
    playlistsQuery.error.status === 0;

  return (
    <div className="space-y-6 py-4">
      {apiDown && <ApiDownBanner apiUrl={API_URL} />}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Your Library
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {playlists.length} playlist{playlists.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
            {(
              [
                { v: "grid" as const, icon: LayoutGrid, label: "Grid view" },
                { v: "list" as const, icon: List, label: "List view" },
              ]
            ).map((o) => (
              <button
                key={o.v}
                onClick={() => setView(o.v)}
                aria-label={o.label}
                className={cn(
                  "cursor-pointer rounded-full p-2 transition-colors",
                  view === o.v
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white",
                )}
              >
                <o.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> New playlist
          </Button>
        </div>
      </div>

      {playlistsQuery.isLoading && <RailSkeleton count={6} />}
      {playlistsQuery.isError && !apiDown && (
        <ErrorState onRetry={() => playlistsQuery.refetch()} />
      )}

      {playlistsQuery.data && playlists.length === 0 && (
        <EmptyState
          icon={<ListMusic className="h-5 w-5" />}
          title="Your library is empty"
          description="Create your first playlist, then add songs from anywhere with the ••• menu."
          action={
            <Button onClick={() => setCreateOpen(true)} className="mt-2">
              <Plus /> Create playlist
            </Button>
          }
        />
      )}

      {hydrated.length > 0 && view === "grid" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {hydrated.map((p) => (
            <PlaylistCard key={p.id} playlist={p} />
          ))}
        </div>
      )}

      {hydrated.length > 0 && view === "list" && (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015]">
          {hydrated.map((p) => {
            const songs = p.songs ?? p.Songs ?? [];
            return (
              <div
                key={p.id}
                className="group flex items-center gap-3 border-b border-white/5 p-3 last:border-0 hover:bg-white/[0.04]"
              >
                <button
                  onClick={() => router.push(`/playlists/${p.id}`)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                >
                  <Artwork seed={p.id} title={p.name} className="h-12 w-12" rounded="rounded-lg" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">
                      {p.name}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      {songs.length} song{songs.length === 1 ? "" : "s"}
                      {p.createdAt
                        ? ` · Created ${formatDate(p.createdAt)}`
                        : ""}
                    </span>
                  </span>
                </button>
                {songs.length > 0 && (
                  <button
                    onClick={() => playQueue(songs, 0)}
                    aria-label={`Play ${p.name}`}
                    className="hidden cursor-pointer rounded-full bg-white p-2.5 text-black opacity-0 transition-all hover:scale-105 group-hover:opacity-100 sm:block"
                  >
                    <Play className="h-4 w-4 fill-current" />
                  </button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label={`Options for ${p.name}`}
                      className="cursor-pointer rounded-full p-2 text-zinc-500 hover:bg-white/10 hover:text-white"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditing(p)}>
                      <Pencil /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleting(p)}
                      className="text-red-400 focus:text-red-300"
                    >
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      <CreatePlaylistDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(p) => router.push(`/playlists/${p.id}`)}
      />
      {editing && (
        <EditPlaylistDialog
          playlist={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
        />
      )}
      {deleting && (
        <DeletePlaylistDialog
          playlist={deleting}
          open={!!deleting}
          onOpenChange={(o) => !o && setDeleting(null)}
        />
      )}
    </div>
  );
}
