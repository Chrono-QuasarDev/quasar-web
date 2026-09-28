"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MoreHorizontal, Pause, Play } from "lucide-react";
import type { Song } from "@/lib/types";
import { artistDisplayName } from "@/lib/format";
import { Artwork } from "@/components/Artwork";
import { SongMenu } from "@/components/menus/SongMenu";
import { usePlayerStore } from "@/stores/player-store";
import { pushRecent } from "@/lib/recent";

export function SongCard({
  song,
  context,
}: {
  song: Song;
  context?: Song[];
}) {
  const current = usePlayerStore((s) => s.current);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playSong = usePlayerStore((s) => s.playSong);
  const toggle = usePlayerStore((s) => s.toggle);

  const isCurrent = current?.id === song.id;
  const playing = isCurrent && isPlaying;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-black/40"
    >
      <Link href={`/songs/${song.id}`} className="block">
        <Artwork
          seed={song.id}
          title={song.title}
          className="aspect-square w-full transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <h3 className="mt-3 truncate text-sm font-semibold text-white">
          {song.title}
        </h3>
        <p className="truncate text-xs text-zinc-400">
          {artistDisplayName(song)}
          {song.albumName ? ` · ${song.albumName}` : ""}
        </p>
      </Link>
      <SongMenu
        song={song}
        trigger={
          <button
            aria-label={`More options for ${song.title}`}
            title="More options"
            className="absolute right-6 top-6 cursor-pointer rounded-full bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-black/85"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        }
      />
      <button
        onClick={() => {
          if (isCurrent) toggle();
          else {
            playSong(song, context ?? [song]);
            pushRecent(song);
          }
        }}
        aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
        className="absolute bottom-20 right-6 flex h-11 w-11 translate-y-2 cursor-pointer items-center justify-center rounded-full bg-accent text-black opacity-0 shadow-lg shadow-black/50 transition-all duration-200 hover:scale-105 hover:brightness-110 group-hover:translate-y-0 group-hover:opacity-100"
      >
        {playing ? (
          <Pause className="h-5 w-5 fill-current" />
        ) : (
          <Play className="ml-0.5 h-5 w-5 fill-current" />
        )}
      </button>
    </motion.div>
  );
}
