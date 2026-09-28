"use client";

import Link from "next/link";
import { MoreHorizontal, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Song } from "@/lib/types";
import { artistDisplayName, formatDuration } from "@/lib/format";
import { Artwork } from "@/components/Artwork";
import { usePlayerStore } from "@/stores/player-store";
import { pushRecent } from "@/lib/recent";
import { SongMenu } from "@/components/menus/SongMenu";

interface SongRowProps {
  song: Song;
  index?: number;
  context?: Song[];
  showArtwork?: boolean;
  showGenre?: boolean;
  className?: string;
}

export function SongRow({
  song,
  index,
  context,
  showArtwork = true,
  showGenre = false,
  className,
}: SongRowProps) {
  const current = usePlayerStore((s) => s.current);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playSong = usePlayerStore((s) => s.playSong);
  const toggle = usePlayerStore((s) => s.toggle);

  const isCurrent = current?.id === song.id;
  const playing = isCurrent && isPlaying;

  const handlePlay = () => {
    if (isCurrent) toggle();
    else {
      playSong(song, context);
      pushRecent(song);
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.06]",
        isCurrent && "bg-white/[0.04]",
        className,
      )}
    >
      {typeof index === "number" ? (
        <button
          onClick={handlePlay}
          className="relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-sm tabular-nums text-zinc-500 hover:text-white"
          aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
        >
          <span className={cn(playing || isCurrent ? "hidden" : "group-hover:hidden")}>
            {index + 1}
          </span>
          <span
            className={cn(
              isCurrent && !playing ? "flex" : "hidden",
              "group-hover:flex items-center justify-center",
            )}
          >
            {playing ? (
              <span className="flex h-4 items-end gap-[2px]" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="eq-bar w-[3px] rounded-full bg-accent" style={{ height: "100%" }} />
                ))}
              </span>
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
          </span>
          {playing && (
            <span className="hidden group-hover:flex">
              <Pause className="h-4 w-4 fill-current" />
            </span>
          )}
          {playing && (
            <span className="flex h-4 items-end gap-[2px] group-hover:hidden" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span key={i} className="eq-bar w-[3px] rounded-full bg-accent" style={{ height: "100%" }} />
              ))}
            </span>
          )}
        </button>
      ) : null}

      {showArtwork && (
        <button onClick={handlePlay} className="relative shrink-0 cursor-pointer" aria-label={`Play ${song.title}`}>
          <Artwork seed={song.id} title={song.title} className="h-12 w-12" rounded="rounded-lg" />
          <span
            className={cn(
              "absolute inset-0 items-center justify-center rounded-lg bg-black/50 text-white transition-opacity",
              playing ? "flex opacity-100" : "hidden group-hover:flex opacity-0 group-hover:opacity-100",
            )}
          >
            {playing ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </span>
        </button>
      )}

      <div className="min-w-0 flex-1">
        <Link
          href={`/songs/${song.id}`}
          className={cn(
            "block truncate text-sm font-medium hover:underline",
            isCurrent ? "text-accent" : "text-white",
          )}
        >
          {song.title}
        </Link>
        <p className="truncate text-xs text-zinc-400">
          {song.artistId ? (
            <Link href={`/artists/${song.artistId}`} className="hover:text-zinc-200 hover:underline">
              {artistDisplayName(song)}
            </Link>
          ) : (
            artistDisplayName(song)
          )}
          {song.albumName ? ` · ${song.albumName}` : ""}
          {showGenre && song.genre ? ` · ${song.genre}` : ""}
        </p>
      </div>

      <span className="hidden text-xs tabular-nums text-zinc-500 sm:block">
        {formatDuration(song.durationMs)}
      </span>

      <SongMenu
        song={song}
        trigger={
          <button
            className="cursor-pointer rounded-full p-2 text-zinc-500 transition-all hover:bg-white/10 hover:text-white"
            aria-label={`More options for ${song.title}`}
            title="More options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        }
      />
    </div>
  );
}
