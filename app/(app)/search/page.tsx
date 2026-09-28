"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { searchSongs, songKeys } from "@/lib/api/songs";
import { API_URL, ApiError } from "@/lib/api/client";
import { getRecentSearches, pushRecentSearch } from "@/lib/recent";
import { SongRow } from "@/components/cards/SongRow";
import {
  ApiDownBanner,
  ErrorState,
  SearchEmpty,
  SongRowSkeleton,
} from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Filter = "all" | "title" | "album" | "genre";

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: "all", label: "All" },
  { value: "title", label: "Title" },
  { value: "album", label: "Album" },
  { value: "genre", label: "Genre" },
];

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const debounced = useDebounced(query, 400);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [debounced]);

  useEffect(() => {
    setPage(1);
  }, [debounced, filter]);

  const params = useMemo(() => {
    const base = { page, size: 20 as const };
    if (!debounced.trim()) return null;
    if (filter === "all") return { ...base, q: debounced.trim() };
    if (filter === "title") return { ...base, title: debounced.trim() };
    if (filter === "album") return { ...base, album: debounced.trim() };
    return { ...base, genre: debounced.trim() };
  }, [debounced, filter, page]);

  const searchQuery = useQuery({
    queryKey: songKeys.search(params ?? { q: "" }),
    queryFn: () => searchSongs(params ?? { q: "" }),
    enabled: params !== null,
  });

  useEffect(() => {
    if (debounced.trim() && searchQuery.data) {
      pushRecentSearch(debounced.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery.data]);

  const results = searchQuery.data?.data ?? [];
  const meta = searchQuery.data?.meta;
  const apiDown =
    searchQuery.isError &&
    searchQuery.error instanceof ApiError &&
    searchQuery.error.status === 0;

  const genres = ["Afrobeats", "Hip-Hop", "R&B", "Pop", "Amapiano", "Highlife", "Jazz", "Electronic"];

  return (
    <div className="space-y-6 py-4">
      {apiDown && <ApiDownBanner apiUrl={API_URL} />}

      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Search</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Find songs by title, album, or genre.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="h-13 rounded-2xl pl-11 pr-11 text-base"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1.5 text-zinc-500 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              filter === f.value
                ? "bg-white text-black"
                : "bg-white/10 text-zinc-300 hover:bg-white/15",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!debounced.trim() && (
        <div className="space-y-6">
          {recentSearches.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">
                Recent searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="cursor-pointer rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">
              Browse genres
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {genres.map((g, i) => (
                <button
                  key={g}
                  onClick={() => {
                    setFilter("genre");
                    setQuery(g);
                  }}
                  className="group relative h-24 cursor-pointer overflow-hidden rounded-2xl p-4 text-left"
                  style={{
                    background: `linear-gradient(135deg, hsl(${(i * 47) % 360} 70% 45%), hsl(${(i * 47 + 40) % 360} 70% 30%))`,
                  }}
                >
                  <span className="text-base font-black text-white drop-shadow">
                    {g}
                  </span>
                  <span className="absolute -bottom-4 -right-4 h-20 w-20 rotate-12 rounded-xl bg-black/25 transition-transform group-hover:rotate-6 group-hover:scale-110" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {debounced.trim() && (
        <div className="space-y-3">
          {searchQuery.isLoading && (
            <div className="space-y-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <SongRowSkeleton key={i} />
              ))}
            </div>
          )}
          {searchQuery.isError && !apiDown && (
            <ErrorState onRetry={() => searchQuery.refetch()} />
          )}
          {searchQuery.data && results.length === 0 && (
            <SearchEmpty query={debounced.trim()} />
          )}
          {results.length > 0 && (
            <>
              <p className="text-xs tabular-nums text-zinc-500">
                {meta?.totalItems ?? results.length} result
                {(meta?.totalItems ?? results.length) === 1 ? "" : "s"}
              </p>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-2">
                {results.map((song, i) => (
                  <SongRow
                    key={`${song.id ?? "song"}-${i}`}
                    song={song}
                    index={(meta ? (meta.page - 1) * meta.limit : 0) + i}
                    context={results}
                    showGenre
                  />
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
        </div>
      )}
    </div>
  );
}
