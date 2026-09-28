"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { Song, SortField, SortOrder } from "@/lib/types";
import { getNewReleases, discoveryKeys } from "@/lib/api/discovery";
import { listSongs, songKeys } from "@/lib/api/songs";
import { API_URL, ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import { usePlayerStore } from "@/stores/player-store";
import { getRecent } from "@/lib/recent";
import { greeting } from "@/lib/format";
import { Artwork } from "@/components/Artwork";
import { SongCard } from "@/components/cards/SongCard";
import { SongRow } from "@/components/cards/SongRow";
import { SectionRail } from "@/components/cards/SectionRail";
import {
  ApiDownBanner,
  EmptyState,
  ErrorState,
  RailSkeleton,
  SongRowSkeleton,
} from "@/components/states";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS: Array<{ value: SortField; label: string }> = [
  { value: "releaseDate", label: "Release date" },
  { value: "title", label: "Title" },
  { value: "albumName", label: "Album" },
  { value: "genre", label: "Genre" },
];

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const playQueue = usePlayerStore((s) => s.playQueue);

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>("releaseDate");
  const [orderBy, setOrderBy] = useState<SortOrder>("desc");
  const [recent, setRecent] = useState<Song[]>([]);

  useEffect(() => {
    setRecent(getRecent());
    const onUpdate = () => setRecent(getRecent());
    window.addEventListener("quasar:recent-updated", onUpdate);
    return () => window.removeEventListener("quasar:recent-updated", onUpdate);
  }, []);

  const newReleasesQuery = useQuery({
    queryKey: discoveryKeys.newReleases({ page, size: 10, sortBy, orderBy }),
    queryFn: () => getNewReleases({ page, size: 10, sortBy, orderBy }),
  });

  const topSongsQuery = useQuery({
    queryKey: songKeys.list({ page: 1, size: 8 }),
    queryFn: () => listSongs({ page: 1, size: 8 }),
  });

  const apiDown =
    (newReleasesQuery.isError &&
      newReleasesQuery.error instanceof ApiError &&
      newReleasesQuery.error.status === 0) ||
    (topSongsQuery.isError &&
      topSongsQuery.error instanceof ApiError &&
      topSongsQuery.error.status === 0);

  const newReleases = newReleasesQuery.data?.data ?? [];
  const meta = newReleasesQuery.data?.meta;
  const topSongs = topSongsQuery.data?.data ?? [];
  const quickPicks = topSongs.slice(0, 6);

  const playAll = useCallback(() => {
    if (newReleases.length) playQueue(newReleases, 0);
  }, [newReleases, playQueue]);

  return (
    <div className="space-y-10 py-4">
      {apiDown && <ApiDownBanner apiUrl={API_URL} />}

      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {greeting()}, {user?.username ?? "listener"}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Fresh drops, quick picks, and your orbit — all in one place.
          </p>
        </div>
        {newReleases.length > 0 && (
          <Button onClick={playAll}>
            <Play className="fill-current" /> Play new releases
          </Button>
        )}
      </div>

      {/* Quick picks */}
      <SectionRail title="Quick picks" subtitle="Jump straight back in">
        {topSongsQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SongRowSkeleton key={i} />
            ))}
          </div>
        ) : topSongsQuery.isError ? (
          <ErrorState onRetry={() => topSongsQuery.refetch()} />
        ) : quickPicks.length === 0 ? (
          <EmptyState
            title="No songs yet"
            description="Once songs are added to the catalog, your quick picks will appear here."
          />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {quickPicks.map((song, i) => (
              <QuickPick key={`${song.id ?? "song"}-${i}`} song={song} context={topSongs} />
            ))}
          </div>
        )}
      </SectionRail>

      {/* New releases */}
      <section id="new" className="scroll-mt-24 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              New releases
            </h2>
            <p className="mt-0.5 text-sm text-zinc-400">
              Songs released in the last 30 days
              {meta ? ` · ${meta.totalItems} tracks` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortField);
                setPage(1);
              }}
              aria-label="Sort by"
              className="h-9 cursor-pointer rounded-full border border-white/10 bg-white/5 px-3 text-xs font-semibold text-zinc-300 outline-none hover:bg-white/10"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-zinc-900">
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setOrderBy((o) => (o === "asc" ? "desc" : "asc"));
                setPage(1);
              }}
              aria-label="Toggle sort order"
              className="h-9 cursor-pointer rounded-full border border-white/10 bg-white/5 px-3 text-xs font-bold text-zinc-300 hover:bg-white/10"
            >
              {orderBy === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          </div>
        </div>

        {newReleasesQuery.isLoading ? (
          <RailSkeleton />
        ) : newReleasesQuery.isError ? (
          <ErrorState onRetry={() => newReleasesQuery.refetch()} />
        ) : newReleases.length === 0 ? (
          <EmptyState
            title="Nothing fresh this month"
            description="No songs were released in the last 30 days. Check back soon."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {newReleases.map((song, i) => (
                <SongCard key={`${song.id ?? "song"}-${i}`} song={song} context={newReleases} />
              ))}
            </div>
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft /> Prev
                </Button>
                <span className="text-xs tabular-nums text-zinc-500">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight />
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Recently played */}
      {recent.length > 0 && (
        <SectionRail title="Recently played" subtitle="Your orbit history">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {recent.slice(0, 6).map((song, i) => (
              <SongCard key={`${song.id ?? "song"}-${i}`} song={song} context={recent} />
            ))}
          </div>
        </SectionRail>
      )}

      {/* All songs preview */}
      <SectionRail title="From the catalog" href="/search" actionLabel="Browse all">
        {topSongsQuery.isLoading ? (
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <SongRowSkeleton key={i} />
            ))}
          </div>
        ) : topSongsQuery.isError ? (
          <ErrorState onRetry={() => topSongsQuery.refetch()} />
        ) : (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-2">
            {topSongs.map((song, i) => (
              <SongRow key={`${song.id ?? "song"}-${i}`} song={song} index={i} context={topSongs} />
            ))}
          </div>
        )}
      </SectionRail>
    </div>
  );
}

function QuickPick({ song, context }: { song: Song; context: Song[] }) {
  const playSong = usePlayerStore((s) => s.playSong);
  return (
    <button
      onClick={() => playSong(song, context)}
      className="group flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] pr-3 text-left transition-all hover:border-white/15 hover:bg-white/[0.07]"
    >
      <Artwork seed={song.id} title={song.title} className="h-14 w-14" rounded="rounded-none" />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
        {song.title}
      </span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-black opacity-0 transition-all group-hover:opacity-100">
        <Play className="ml-0.5 h-4 w-4 fill-current" />
      </span>
    </button>
  );
}
