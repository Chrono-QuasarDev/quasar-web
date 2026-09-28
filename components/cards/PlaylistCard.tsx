"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ListMusic, Play } from "lucide-react";
import type { Playlist } from "@/lib/types";
import { Artwork } from "@/components/Artwork";
import { usePlayerStore } from "@/stores/player-store";

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const playQueue = usePlayerStore((s) => s.playQueue);
  const songs = playlist.songs ?? playlist.Songs ?? [];
  const count = playlist.songCount ?? songs.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-black/40"
    >
      <Link href={`/playlists/${playlist.id}`} className="block">
        <div className="relative">
          <Artwork seed={playlist.id} title={playlist.name} className="aspect-square w-full" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            <ListMusic className="h-3 w-3" />
            {count} {count === 1 ? "song" : "songs"}
          </div>
        </div>
        <h3 className="mt-3 truncate text-sm font-semibold text-white">
          {playlist.name}
        </h3>
        <p className="truncate text-xs text-zinc-400">
          {playlist.User?.username ? `By ${playlist.User.username}` : "Playlist"}
        </p>
      </Link>
      {songs.length > 0 && (
        <button
          onClick={() => playQueue(songs, 0)}
          aria-label={`Play ${playlist.name}`}
          className="absolute bottom-20 right-6 flex h-11 w-11 translate-y-2 cursor-pointer items-center justify-center rounded-full bg-accent text-black opacity-0 shadow-lg shadow-black/50 transition-all duration-200 hover:scale-105 hover:brightness-110 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Play className="ml-0.5 h-5 w-5 fill-current" />
        </button>
      )}
    </motion.div>
  );
}
