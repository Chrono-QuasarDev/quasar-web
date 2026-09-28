"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, UserRound } from "lucide-react";
import { getPublicProfile, userKeys } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { formatDate, initials } from "@/lib/format";
import { PlaylistCard } from "@/components/cards/PlaylistCard";
import { SectionRail } from "@/components/cards/SectionRail";
import { EmptyState, ErrorState, RailSkeleton } from "@/components/states";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const profileQuery = useQuery({
    queryKey: userKeys.profile(id),
    queryFn: () => getPublicProfile(id),
  });

  const profile = profileQuery.data?.data;
  const playlists = profile?.Playlists ?? profile?.playlists ?? [];

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-8 py-4">
        <div className="flex items-center gap-5">
          <Skeleton className="h-28 w-28 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <RailSkeleton />
      </div>
    );
  }

  if (profileQuery.isError) {
    const err = profileQuery.error;
    if (err instanceof ApiError && err.isNotFound) {
      return (
        <div className="py-10">
          <EmptyState
            icon={<UserRound className="h-5 w-5" />}
            title="User not found"
            description="This profile doesn't exist or was removed."
          />
        </div>
      );
    }
    return (
      <div className="py-10">
        <ErrorState onRetry={() => profileQuery.refetch()} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-10 py-4">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Avatar className="h-28 w-28 border-2 border-white/10">
          <AvatarFallback className="text-3xl">
            {initials(profile.username)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
            Profile
          </p>
          <h1 className="mt-1 text-4xl font-black tracking-tight text-white">
            {profile.username}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            {profile.role && <Badge variant="secondary">{profile.role}</Badge>}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Joined {formatDate(profile.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <SectionRail
        title="Playlists"
        subtitle={
          playlists.length
            ? `${playlists.length} public playlist${playlists.length === 1 ? "" : "s"}`
            : undefined
        }
      >
        {playlists.length === 0 ? (
          <EmptyState
            title="No playlists to show"
            description={`${profile.username} hasn't shared any playlists yet.`}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {playlists.map((p) => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </div>
        )}
      </SectionRail>
    </div>
  );
}
