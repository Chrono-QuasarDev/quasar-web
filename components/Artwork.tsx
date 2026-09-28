"use client";

import { useState } from "react";
import { Music2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { artworkGradient, initials } from "@/lib/format";

interface ArtworkProps {
  seed: string;
  title?: string;
  imageUrl?: string | null;
  className?: string;
  iconClassName?: string;
  rounded?: string;
}

/**
 * Deterministic gradient artwork — or a real image when `imageUrl` is given.
 * Broken/expired image URLs fall back to the gradient automatically.
 */
export function Artwork({
  seed,
  title,
  imageUrl,
  className,
  iconClassName,
  rounded = "rounded-xl",
}: ArtworkProps) {
  const [failed, setFailed] = useState(false);

  if (imageUrl && !failed) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-white/5",
          rounded,
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title ?? "Artwork"}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        rounded,
        className,
      )}
      style={{ background: artworkGradient(seed) }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-black/25" />
      <div
        className="absolute -right-1/3 -top-1/3 h-full w-full rounded-full opacity-40 blur-2xl"
        style={{ background: "rgba(255,255,255,0.5)" }}
      />
      {title ? (
        <span className="relative text-lg font-black tracking-tight text-white/95 drop-shadow-lg">
          {initials(title)}
        </span>
      ) : (
        <Music2 className={cn("relative h-1/3 w-1/3 text-white/90", iconClassName)} />
      )}
    </div>
  );
}
