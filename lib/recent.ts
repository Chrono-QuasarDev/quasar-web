"use client";

import type { Song } from "@/lib/types";

const KEY = "quasar-recent";
const MAX = 12;

export function getRecent(): Song[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Song[]) : [];
  } catch {
    return [];
  }
}

export function pushRecent(song: Song): Song[] {
  if (typeof window === "undefined") return [];
  try {
    const list = getRecent().filter((s) => s.id !== song.id);
    list.unshift(song);
    const trimmed = list.slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent("quasar:recent-updated"));
    return trimmed;
  } catch {
    return [];
  }
}

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("quasar-recent-searches");
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(q: string) {
  if (typeof window === "undefined" || !q.trim()) return;
  try {
    const list = getRecentSearches().filter(
      (s) => s.toLowerCase() !== q.toLowerCase(),
    );
    list.unshift(q.trim());
    window.localStorage.setItem(
      "quasar-recent-searches",
      JSON.stringify(list.slice(0, 8)),
    );
  } catch {
    /* ignore */
  }
}
