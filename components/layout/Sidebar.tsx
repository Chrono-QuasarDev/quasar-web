"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AudioWaveform,
  Home,
  Library,
  ListMusic,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { listPlaylists, playlistKeys } from "@/lib/api/playlists";
import { usePlaylistDetails } from "@/hooks/use-playlist-details";
import { useAuthStore } from "@/stores/auth-store";
import { Artwork } from "@/components/Artwork";
import { CreatePlaylistDialog } from "@/components/modals/PlaylistDialogs";

const NAV = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Your Library", icon: Library },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [createOpen, setCreateOpen] = useState(false);

  const playlistsQuery = useQuery({
    queryKey: playlistKeys.list,
    queryFn: listPlaylists,
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const playlists = playlistsQuery.data?.data ?? [];
  // List rows carry no songs — hydrate from cached detail queries so the
  // per-playlist counts are real.
  const hydrated = usePlaylistDetails(playlists);

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-2 p-2 pr-0 lg:flex">
      <div className="rounded-2xl border border-white/[0.06] bg-panel/80 p-3">
        <Link href="/home" className="flex items-center gap-2.5 px-2 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-black shadow-lg shadow-accent/25">
            <AudioWaveform className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-black tracking-tight text-white">
            Quasar
          </span>
        </Link>
        <nav className="mt-2 space-y-1">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/home" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <item.icon
                  className={cn("h-5 w-5", active && "text-accent")}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/[0.06] bg-panel/80 p-3">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
            <ListMusic className="h-4 w-4" />
            Playlists
          </span>
          <button
            onClick={() => setCreateOpen(true)}
            aria-label="Create playlist"
            className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto">
          {playlistsQuery.isLoading && (
            <p className="px-2 py-3 text-xs text-zinc-500">Loading…</p>
          )}
          {hydrated.map((p) => {
            const active = pathname === `/playlists/${p.id}`;
            return (
              <button
                key={p.id}
                onClick={() => router.push(`/playlists/${p.id}`)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition-colors",
                  active ? "bg-white/10" : "hover:bg-white/5",
                )}
              >
                <Artwork seed={p.id} title={p.name} className="h-10 w-10" rounded="rounded-lg" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-zinc-100">
                    {p.name}
                  </span>
                  <span className="block text-xs text-zinc-500">
                    {(p.songs?.length ?? p.Songs?.length ?? p.songCount ?? 0)} songs
                  </span>
                </span>
              </button>
            );
          })}
          {!playlistsQuery.isLoading && playlists.length === 0 && (
            <p className="px-2 py-3 text-xs leading-relaxed text-zinc-500">
              No playlists yet. Hit <Plus className="inline h-3 w-3" /> to create
              your first.
            </p>
          )}
        </div>
      </div>

      <CreatePlaylistDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(p) => router.push(`/playlists/${p.id}`)}
      />
    </aside>
  );
}
