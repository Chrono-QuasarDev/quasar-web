"use client";

import { create } from "zustand";
import type { Song } from "@/lib/types";

export type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  queue: Song[];
  index: number;
  current: Song | null;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  playbackRate: number;
  queueOpen: boolean;
  expanded: boolean;

  playQueue: (songs: Song[], startIndex?: number) => void;
  playSong: (song: Song, context?: Song[]) => void;
  toggle: () => void;
  setPlaying: (playing: boolean) => void;
  next: (auto?: boolean) => void;
  prev: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setPlaybackRate: (r: number) => void;
  setQueueOpen: (open: boolean) => void;
  setExpanded: (open: boolean) => void;
  removeFromQueue: (queueIndex: number) => void;
  clearQueue: () => void;
}

function readNumber(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  queue: [],
  index: 0,
  current: null,
  isPlaying: false,
  volume: readNumber("quasar-volume", 0.9),
  muted: false,
  shuffle: false,
  repeat: "off",
  playbackRate: 1,
  queueOpen: false,
  expanded: false,

  playQueue: (songs, startIndex = 0) => {
    if (!songs.length) return;
    const idx = Math.min(Math.max(startIndex, 0), songs.length - 1);
    set({
      queue: songs,
      index: idx,
      current: songs[idx],
      isPlaying: true,
      expanded: false,
    });
  },

  playSong: (song, context) => {
    const { queue, index } = get();
    if (context && context.length) {
      const at = context.findIndex((s) => s.id === song.id);
      set({
        queue: context,
        index: at >= 0 ? at : 0,
        current: song,
        isPlaying: true,
      });
      return;
    }
    const existing = queue.findIndex((s) => s.id === song.id);
    if (existing >= 0) {
      set({ index: existing, current: song, isPlaying: true });
    } else {
      const nextQueue = [...queue];
      nextQueue.splice(index + 1, 0, song);
      set({
        queue: nextQueue,
        index: index + 1,
        current: song,
        isPlaying: true,
      });
    }
  },

  toggle: () => {
    const { current, isPlaying } = get();
    if (!current) return;
    set({ isPlaying: !isPlaying });
  },

  setPlaying: (playing) => set({ isPlaying: playing }),

  next: (auto = false) => {
    const { queue, index, shuffle, repeat, current } = get();
    if (!queue.length || !current) return;
    if (auto && repeat === "one") {
      // Restart same track — handled by audio element loop, but keep state.
      set({ isPlaying: true });
      return;
    }
    if (shuffle && queue.length > 1) {
      let n = index;
      while (n === index) n = Math.floor(Math.random() * queue.length);
      set({ index: n, current: queue[n], isPlaying: true });
      return;
    }
    if (index < queue.length - 1) {
      set({ index: index + 1, current: queue[index + 1], isPlaying: true });
    } else if (repeat === "all") {
      set({ index: 0, current: queue[0], isPlaying: true });
    } else if (!auto) {
      set({ index: 0, current: queue[0], isPlaying: true });
    } else {
      set({ isPlaying: false });
    }
  },

  prev: () => {
    const { queue, index } = get();
    if (!queue.length) return;
    const n = index > 0 ? index - 1 : 0;
    set({ index: n, current: queue[n], isPlaying: true });
  },

  setVolume: (v) => {
    const volume = Math.min(1, Math.max(0, v));
    try {
      window.localStorage.setItem("quasar-volume", String(volume));
    } catch {
      /* ignore */
    }
    set({ volume, muted: volume === 0 ? true : get().muted });
  },

  toggleMute: () => set((s) => ({ muted: !s.muted })),

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

  cycleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off",
    })),

  setPlaybackRate: (r) => set({ playbackRate: r }),

  setQueueOpen: (open) => set({ queueOpen: open }),
  setExpanded: (open) => set({ expanded: open }),

  removeFromQueue: (queueIndex) => {
    const { queue, index, current } = get();
    const nextQueue = queue.filter((_, i) => i !== queueIndex);
    if (!nextQueue.length) {
      set({ queue: [], index: 0, current: null, isPlaying: false });
      return;
    }
    let nextIndex = index;
    if (queueIndex < index) nextIndex = index - 1;
    if (queueIndex === index) {
      nextIndex = Math.min(index, nextQueue.length - 1);
      set({
        queue: nextQueue,
        index: nextIndex,
        current: nextQueue[nextIndex],
        isPlaying: true,
      });
      return;
    }
    set({ queue: nextQueue, index: nextIndex, current });
  },

  clearQueue: () =>
    set({ queue: [], index: 0, current: null, isPlaying: false }),
}));
