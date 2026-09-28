"use client";

import type { ReactNode } from "react";
import { CloudOff, Inbox, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-zinc-400">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-zinc-400">{description}</p>
      )}
      {action}
    </div>
  );
}

export function SearchEmpty({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<SearchX className="h-5 w-5" />}
      title={`No results for "${query}"`}
      description="Check your spelling, or try a different song, album or genre."
    />
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this. Check that the API is running and try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-panel px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        <CloudOff className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="max-w-sm text-sm text-zinc-400">{description}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}

export function ApiDownBanner({ apiUrl }: { apiUrl: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
      <CloudOff className="h-4 w-4 shrink-0" />
      <p>
        Cannot reach the API at{" "}
        <span className="font-mono text-xs">{apiUrl}</span>. Start it with{" "}
        <span className="font-mono text-xs">npm start</span> in the backend
        repo, then refresh.
      </p>
    </div>
  );
}

export function SongRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl p-2">
      <Skeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function RailSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
