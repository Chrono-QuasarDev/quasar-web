// Formatting + deterministic artwork helpers (API has no cover-art field,
// so we generate beautiful, stable gradients per song).

export function formatDuration(ms?: number | null): string {
  if (!ms || ms <= 0) return "--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatDurationShort(ms?: number | null): string {
  if (!ms || ms <= 0) return "0m";
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "Unknown";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatYear(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return String(d.getFullYear());
}

export function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function initials(name?: string | null): string {
  if (!name) return "♪";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ─── Deterministic gradient artwork ───

const PALETTES: Array<[string, string, string]> = [
  ["#8b5cf6", "#6d28d9", "#22d3ee"],
  ["#f43f5e", "#9d174d", "#fb923c"],
  ["#22d3ee", "#0e7490", "#a5f3fc"],
  ["#a3e635", "#15803d", "#bef264"],
  ["#f59e0b", "#b45309", "#fbbf24"],
  ["#6366f1", "#312e81", "#c084fc"],
  ["#14b8a6", "#0f766e", "#5eead4"],
  ["#d946ef", "#86198f", "#f0abfc"],
  ["#3b82f6", "#1e3a8a", "#93c5fd"],
  ["#84cc16", "#3f6212", "#fef08a"],
];

function hashString(s: string | null | undefined): number {
  const str = s ?? "";
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function artworkGradient(seed: string | null | undefined): string {
  const key = seed ?? "";
  const [a, b, c] = PALETTES[hashString(key) % PALETTES.length];
  const angle = hashString(key + ":angle") % 360;
  return `linear-gradient(${angle}deg, ${a} 0%, ${b} 55%, ${c} 130%)`;
}

export function artworkGlow(seed: string | null | undefined): string {
  const [a] = PALETTES[hashString(seed ?? "") % PALETTES.length];
  return a;
}

export function artistDisplayName(song: {
  ArtistProfile?: {
    User?: { username?: string };
    user?: { username?: string };
  } | null;
  artistName?: string;
}): string {
  return (
    song.ArtistProfile?.User?.username ??
    song.ArtistProfile?.user?.username ??
    song.artistName ??
    "Unknown artist"
  );
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
