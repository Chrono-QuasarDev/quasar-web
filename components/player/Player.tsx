"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Gauge,
  ListMusic,
  Loader2,
  Maximize2,
  MoreHorizontal,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Song } from "@/lib/types";
import { artistDisplayName, formatDuration } from "@/lib/format";
import { Artwork } from "@/components/Artwork";
import { SongMenu } from "@/components/menus/SongMenu";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/player-store";

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Player() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);

  const current = usePlayerStore((s) => s.current);
  const queue = usePlayerStore((s) => s.queue);
  const index = usePlayerStore((s) => s.index);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const playbackRate = usePlayerStore((s) => s.playbackRate);
  const queueOpen = usePlayerStore((s) => s.queueOpen);
  const expanded = usePlayerStore((s) => s.expanded);

  const toggle = usePlayerStore((s) => s.toggle);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const setPlaybackRate = usePlayerStore((s) => s.setPlaybackRate);
  const setQueueOpen = usePlayerStore((s) => s.setQueueOpen);
  const setExpanded = usePlayerStore((s) => s.setExpanded);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);

  const streamUrl = current ? `/api/stream/${current.id}` : null;

  // Load + play when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current || !streamUrl) return;
    setLoading(true);
    setProgress(0);
    setDuration(
      current.durationMs ? current.durationMs / 1000 : 0,
    );
    audio.src = streamUrl;
    audio.playbackRate = usePlayerStore.getState().playbackRate;
    if (usePlayerStore.getState().isPlaying) {
      audio.play().catch(() => setPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  // Play / pause sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (isPlaying) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, current, setPlaying]);

  // Volume sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  // Playback rate sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
  }, [playbackRate]);

  // Repeat-one via element loop
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = repeat === "one";
  }, [repeat]);

  // MediaSession integration
  useEffect(() => {
    if (!("mediaSession" in navigator) || !current) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.title,
        artist: artistDisplayName(current),
        album: current.albumName ?? "",
      });
      navigator.mediaSession.setActionHandler("play", () => setPlaying(true));
      navigator.mediaSession.setActionHandler("pause", () => setPlaying(false));
      navigator.mediaSession.setActionHandler("previoustrack", () => prev());
      navigator.mediaSession.setActionHandler("nexttrack", () => next());
    } catch {
      /* unsupported */
    }
  }, [current, setPlaying, prev, next]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;
      if (e.code === "Space" && current) {
        e.preventDefault();
        toggle();
      }
      if (e.key === "ArrowRight" && current && audioRef.current) {
        audioRef.current.currentTime = Math.min(
          (audioRef.current.duration || 0),
          audioRef.current.currentTime + 10,
        );
      }
      if (e.key === "ArrowLeft" && current && audioRef.current) {
        audioRef.current.currentTime = Math.max(
          0,
          audioRef.current.currentTime - 10,
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, toggle]);

  const seek = useCallback((value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setProgress(value[0]);
  }, []);

  if (!current) return null;

  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d)) setDuration(d);
          setLoading(false);
        }}
        onCanPlay={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onPlaying={() => {
          setLoading(false);
          setPlaying(true);
        }}
        onPause={() => {
          if (!audioRef.current?.ended) setPlaying(false);
        }}
        onEnded={() => next(true)}
        onError={() => {
          setLoading(false);
          setPlaying(false);
          toast.error("Could not stream this song. Is the API running?");
        }}
      />

      {/* ── Mini / full bar ── */}
      <div className="fixed inset-x-0 bottom-[64px] z-50 px-2 sm:px-3 lg:bottom-3 lg:px-3">
        <div className="glass mx-auto max-w-6xl rounded-2xl border border-white/10 shadow-2xl shadow-black/60">
          {/* Mobile progress hairline */}
          <div className="h-1 overflow-hidden rounded-t-2xl bg-white/10 lg:hidden">
            <div
              className="h-full bg-accent transition-[width]"
              style={{
                width: `${duration ? (progress / duration) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="flex items-center gap-2 px-2 py-2 sm:gap-3 sm:px-3">
            {/* Track info */}
            <button
              onClick={() => setExpanded(true)}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl p-1 text-left lg:max-w-[280px]"
            >
              <Artwork seed={current.id} title={current.title} className="h-11 w-11 sm:h-12 sm:w-12" rounded="rounded-lg" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">
                  {current.title}
                </span>
                <span className="block truncate text-xs text-zinc-400">
                  {artistDisplayName(current)}
                </span>
              </span>
            </button>
            <SongMenu
              song={current}
              trigger={
                <button
                  aria-label={`More options for ${current.title}`}
                  title="More options"
                  className="shrink-0 cursor-pointer rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              }
            />

            {/* Center controls (desktop) */}
            <div className="hidden flex-1 flex-col items-center gap-1.5 lg:flex">
              <div className="flex items-center gap-1">
                <ControlButton
                  label="Shuffle"
                  active={shuffle}
                  onClick={toggleShuffle}
                >
                  <Shuffle className="h-4 w-4" />
                </ControlButton>
                <ControlButton label="Previous" onClick={prev}>
                  <SkipBack className="h-5 w-5 fill-current" />
                </ControlButton>
                <button
                  onClick={toggle}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="mx-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="ml-0.5 h-5 w-5 fill-current" />
                  )}
                </button>
                <ControlButton label="Next" onClick={() => next()}>
                  <SkipForward className="h-5 w-5 fill-current" />
                </ControlButton>
                <ControlButton
                  label="Repeat"
                  active={repeat !== "off"}
                  onClick={cycleRepeat}
                >
                  <RepeatIcon className="h-4 w-4" />
                </ControlButton>
              </div>
              <div className="flex w-full max-w-xl items-center gap-2 text-[11px] tabular-nums text-zinc-500">
                <span>{formatClock(progress)}</span>
                <Slider
                  value={[Math.min(progress, duration || 0)]}
                  max={duration || 1}
                  step={1}
                  onValueChange={seek}
                  aria-label="Seek"
                  className="flex-1"
                />
                <span>{formatClock(duration || (current.durationMs ?? 0) / 1000)}</span>
              </div>
            </div>

            {/* Mobile play button */}
            <button
              onClick={toggle}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-black lg:hidden"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              )}
            </button>

            {/* Right cluster (desktop) */}
            <div className="hidden flex-1 items-center justify-end gap-1 lg:flex lg:max-w-[280px]">
              <ControlButton
                label="Playback speed"
                onClick={() => {
                  const rates = [1, 1.25, 1.5, 2];
                  const i = rates.indexOf(playbackRate);
                  setPlaybackRate(rates[(i + 1) % rates.length]);
                }}
              >
                <span className="flex items-center gap-1 text-[11px] font-bold tabular-nums">
                  <Gauge className="h-4 w-4" />
                  {playbackRate}x
                </span>
              </ControlButton>
              <ControlButton
                label={queueOpen ? "Close queue" : "Open queue"}
                active={queueOpen}
                onClick={() => setQueueOpen(!queueOpen)}
              >
                <ListMusic className="h-4 w-4" />
              </ControlButton>
              <ControlButton label="Expand" onClick={() => setExpanded(true)}>
                <Maximize2 className="h-4 w-4" />
              </ControlButton>
              <ControlButton
                label={muted ? "Unmute" : "Mute"}
                onClick={toggleMute}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </ControlButton>
              <Slider
                value={[muted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={([v]) => setVolume(v)}
                aria-label="Volume"
                className="w-24"
              />
            </div>

            {/* Mobile queue button */}
            <button
              onClick={() => setQueueOpen(!queueOpen)}
              aria-label="Toggle queue"
              className="rounded-full p-2.5 text-zinc-400 hover:text-white lg:hidden cursor-pointer"
            >
              <ListMusic className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Queue drawer ── */}
      {queueOpen && (
        <QueueDrawer
          queue={queue}
          index={index}
          onClose={() => setQueueOpen(false)}
          onRemove={removeFromQueue}
        />
      )}

      {/* ── Expanded view ── */}
      {expanded && (
        <ExpandedPlayer
          song={current}
          progress={progress}
          duration={duration || (current.durationMs ?? 0) / 1000}
          loading={loading}
          onSeek={seek}
          onClose={() => setExpanded(false)}
        />
      )}
    </>
  );
}

function ControlButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "relative rounded-full p-2 transition-colors cursor-pointer",
        active ? "text-accent" : "text-zinc-400 hover:text-white",
      )}
    >
      {children}
      {active && (
        <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
      )}
    </button>
  );
}

function QueueDrawer({
  queue,
  index,
  onClose,
  onRemove,
}: {
  queue: Song[];
  index: number;
  onClose: () => void;
  onRemove: (i: number) => void;
}) {
  const playQueue = usePlayerStore((s) => s.playQueue);
  const clearQueue = usePlayerStore((s) => s.clearQueue);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass flex h-full w-full max-w-sm flex-col border-l border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Queue · {queue.length}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={clearQueue}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              aria-label="Close queue"
              className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          {queue.length === 0 && (
            <p className="px-2 py-8 text-center text-sm text-zinc-500">
              Your queue is empty. Play any song to get started.
            </p>
          )}
          {queue.map((song, i) => (
            <div
              key={`${song.id}-${i}`}
              className={cn(
                "group flex items-center gap-3 rounded-xl p-2 transition-colors",
                i === index ? "bg-accent/10" : "hover:bg-white/5",
              )}
            >
              <button
                onClick={() => playQueue(queue, i)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
              >
                <Artwork seed={song.id} title={song.title} className="h-10 w-10" rounded="rounded-lg" />
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate text-sm font-medium",
                      i === index ? "text-accent" : "text-white",
                    )}
                  >
                    {song.title}
                  </span>
                  <span className="block truncate text-xs text-zinc-500">
                    {artistDisplayName(song)}
                    {i === index ? " · Now playing" : ""}
                  </span>
                </span>
              </button>
              <span className="text-xs tabular-nums text-zinc-600">
                {formatDuration(song.durationMs)}
              </span>
              <button
                onClick={() => onRemove(i)}
                aria-label={`Remove ${song.title} from queue`}
                className="rounded-full p-1.5 text-zinc-600 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExpandedPlayer({
  song,
  progress,
  duration,
  loading,
  onSeek,
  onClose,
}: {
  song: Song;
  progress: number;
  duration: number;
  loading: boolean;
  onSeek: (v: number[]) => void;
  onClose: () => void;
}) {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeat = usePlayerStore((s) => s.repeat);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const toggle = usePlayerStore((s) => s.toggle);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const cycleRepeat = usePlayerStore((s) => s.cycleRepeat);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);

  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  return (
    <div className="aurora-bg fixed inset-0 z-[70] flex flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            aria-label="Collapse player"
            className="rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition-colors hover:bg-white/20 cursor-pointer"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Now playing
          </p>
          <SongMenu
            song={song}
            trigger={
              <button
                aria-label={`More options for ${song.title}`}
                title="More options"
                className="cursor-pointer rounded-full bg-white/10 p-2.5 text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            }
          />
        </div>

        <div className="flex flex-1 flex-col justify-center gap-6 py-6">
          <Artwork
            seed={song.id}
            title={song.title}
            className="mx-auto aspect-square w-full max-w-sm shadow-2xl shadow-black/60"
            rounded="rounded-3xl"
          />

          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-white">
              {song.title}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              {song.artistId ? (
                <Link
                  href={`/artists/${song.artistId}`}
                  onClick={onClose}
                  className="hover:text-white hover:underline"
                >
                  {artistDisplayName(song)}
                </Link>
              ) : (
                artistDisplayName(song)
              )}
              {song.albumName ? ` · ${song.albumName}` : ""}
            </p>
          </div>

          <div>
            <Slider
              value={[Math.min(progress, duration || 0)]}
              max={duration || 1}
              step={1}
              onValueChange={onSeek}
              aria-label="Seek"
            />
            <div className="mt-2 flex justify-between text-xs tabular-nums text-zinc-500">
              <span>{formatClock(progress)}</span>
              <span>{formatClock(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <ControlButton
              label="Shuffle"
              active={shuffle}
              onClick={toggleShuffle}
            >
              <Shuffle className="h-5 w-5" />
            </ControlButton>
            <button
              onClick={prev}
              aria-label="Previous"
              className="cursor-pointer rounded-full p-2 text-white transition-transform hover:scale-110"
            >
              <SkipBack className="h-8 w-8 fill-current" />
            </button>
            <button
              onClick={toggle}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform hover:scale-105"
            >
              {loading ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-7 w-7 fill-current" />
              ) : (
                <Play className="ml-1 h-7 w-7 fill-current" />
              )}
            </button>
            <button
              onClick={() => next()}
              aria-label="Next"
              className="cursor-pointer rounded-full p-2 text-white transition-transform hover:scale-110"
            >
              <SkipForward className="h-8 w-8 fill-current" />
            </button>
            <ControlButton
              label="Repeat"
              active={repeat !== "off"}
              onClick={cycleRepeat}
            >
              <RepeatIcon className="h-5 w-5" />
            </ControlButton>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="cursor-pointer rounded-full p-2 text-zinc-400 hover:text-white"
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            <Slider
              value={[muted ? 0 : volume]}
              max={1}
              step={0.01}
              onValueChange={([v]) => setVolume(v)}
              aria-label="Volume"
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
