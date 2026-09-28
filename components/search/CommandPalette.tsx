"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Command } from "cmdk";
import {
  Disc3,
  Home,
  Library,
  Loader2,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";
import { searchSongs, songKeys } from "@/lib/api/songs";
import { artistDisplayName, formatDuration } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";
import { pushRecent, pushRecentSearch } from "@/lib/recent";
import { Artwork } from "@/components/Artwork";

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 400);
  const playSong = usePlayerStore((s) => s.playSong);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("quasar:open-search", () => setOpen(true));
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("quasar:open-search", () => setOpen(true));
    };
  }, []);

  const searchQuery = useQuery({
    queryKey: songKeys.search({ q: debounced }),
    queryFn: () => searchSongs({ q: debounced, size: 8 }),
    enabled: open && debounced.trim().length >= 2,
  });

  const results = useMemo(
    () => searchQuery.data?.data ?? [],
    [searchQuery.data],
  );

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const play = (id: string) => {
    const song = results.find((s) => s.id === id);
    if (!song) return;
    pushRecentSearch(debounced);
    playSong(song, results);
    pushRecent(song);
    setOpen(false);
    setQuery("");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Search Quasar" className="[&_[cmdk-input]]:outline-none">
          <div className="flex items-center gap-3 border-b border-white/10 px-4">
            {searchQuery.isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
            ) : (
              <Search className="h-4 w-4 text-zinc-500" />
            )}
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search songs, albums, genres…"
              className="h-13 w-full bg-transparent py-4 text-sm text-white placeholder:text-zinc-500"
            />
            <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[50vh] overflow-y-auto p-2">
            <Command.Empty className="px-4 py-8 text-center text-sm text-zinc-500">
              {debounced.trim().length >= 2
                ? "No songs found. Try another keyword."
                : "Type at least 2 characters to search, or jump to a page below."}
            </Command.Empty>

            {results.length > 0 && (
              <Command.Group
                heading="Songs"
                className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-500"
              >
                {results.map((song, i) => (
                  <Command.Item
                    key={`${song.id ?? "song"}-${i}`}
                    value={`${song.title} ${artistDisplayName(song)} ${song.id}`}
                    onSelect={() => play(song.id)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-200 aria-selected:bg-white/10 aria-selected:text-white"
                  >
                    <Artwork seed={song.id} title={song.title} className="h-9 w-9" rounded="rounded-lg" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{song.title}</span>
                      <span className="block truncate text-xs text-zinc-500">
                        {artistDisplayName(song)}{song.albumName ? ` · ${song.albumName}` : ""}
                      </span>
                    </span>
                    <span className="text-xs tabular-nums text-zinc-500">
                      {formatDuration(song.durationMs)}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group
              heading="Go to"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-500"
            >
              {[
                { icon: Home, label: "Home", href: "/home" },
                { icon: Search, label: "Search", href: "/search" },
                { icon: Library, label: "Your library", href: "/library" },
                { icon: Sparkles, label: "New releases", href: "/home#new" },
                { icon: Disc3, label: "All songs", href: "/search" },
                { icon: Settings, label: "Settings", href: "/settings" },
              ].map((item) => (
                <Command.Item
                  key={item.label}
                  value={`go to ${item.label}`}
                  onSelect={() => go(item.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-200 aria-selected:bg-white/10 aria-selected:text-white"
                >
                  <item.icon className="h-4 w-4 text-zinc-500" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

export function openCommandPalette() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("quasar:open-search"));
  }
}
