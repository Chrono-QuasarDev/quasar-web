"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Loader2, Pause, Play, UserRound } from "lucide-react";
import { toast } from "sonner";
import { artistKeys, followArtist, getArtist } from "@/lib/api/artists";
import { ApiError } from "@/lib/api/client";
import { usePlayerStore } from "@/stores/player-store";
import { Artwork } from "@/components/Artwork";
import { SongRow } from "@/components/cards/SongRow";
import { SectionRail } from "@/components/cards/SectionRail";
import { EmptyState, ErrorState } from "@/components/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { initials } from "@/lib/format";

export default function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const playQueue = usePlayerStore((s) => s.playQueue);
  const current = usePlayerStore((s) => s.current);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const toggle = usePlayerStore((s) => s.toggle);

  const artistQuery = useQuery({
    queryKey: artistKeys.detail(id),
    queryFn: () => getArtist(id),
  });

  const artist = artistQuery.data?.data;
  // The artist endpoint nests the profile at the top level, not per song —
  // so stamp the known artist name onto songs that lack their own info.
  // This flows into the rows, the queue, the player bar, and recents.
  const songs = useMemo(() => {
    const raw = artist?.songs ?? artist?.Songs ?? [];
    const name = artist?.user?.username ?? artist?.User?.username;
    if (!name) return raw;
    return raw.map((s) =>
      (s.ArtistProfile?.User?.username ??
      s.ArtistProfile?.user?.username ??
      s.artistName)
        ? s
        : { ...s, artistName: name },
    );
  }, [artist]);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    setFollowing(Boolean(artist?.isFollowing));
  }, [artist?.isFollowing]);

  const followMutation = useMutation({
    mutationFn: () => followArtist(id),
    onMutate: () => {
      setFollowing((f) => !f);
    },
    onSuccess: () => {
      toast.success(following ? "Unfollowed artist" : "Following artist");
      queryClient.invalidateQueries({ queryKey: artistKeys.detail(id) });
    },
    onError: (err) => {
      setFollowing((f) => !f);
      toast.error(err instanceof ApiError ? err.message : "Could not follow artist");
    },
  });

  const username = artist?.user?.username ?? artist?.User?.username ?? "Artist";
  const isPlayingThisArtist =
    isPlaying && current && songs.some((s) => s.id === current.id);

  const albums = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    for (const s of songs) {
      const name = s.albumName || "Singles";
      const entry = map.get(name) ?? { name, count: 0 };
      entry.count += 1;
      map.set(name, entry);
    }
    return [...map.values()];
  }, [songs]);

  if (artistQuery.isLoading) {
    return (
      <div className="space-y-8 py-4">
        <div className="flex items-end gap-6">
          <Skeleton className="h-44 w-44 rounded-full" />
          <div className="flex-1 space-y-3 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (artistQuery.isError) {
    const err = artistQuery.error;
    if (err instanceof ApiError && err.isNotFound) {
      return (
        <div className="py-10">
          <EmptyState
            icon={<UserRound className="h-5 w-5" />}
            title="Artist not found"
            description="This artist profile doesn't exist or was removed."
          />
        </div>
      );
    }
    return (
      <div className="py-10">
        <ErrorState onRetry={() => artistQuery.refetch()} />
      </div>
    );
  }

  if (!artist) return null;

  return (
    <div className="space-y-10 py-4">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07]">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `linear-gradient(120deg, rgba(139,92,246,0.5), rgba(34,211,238,0.25) 50%, transparent), #121214`,
          }}
        />
        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:p-8">
          <Avatar className="h-36 w-36 border-4 border-black/30 shadow-2xl sm:h-44 sm:w-44">
            {artist.profilePictureUrl && (
              <AvatarImage src={artist.profilePictureUrl} alt={username} />
            )}
            <AvatarFallback className="text-4xl">
              {initials(username)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-center gap-2">
              <Badge>Artist</Badge>
              <span className="flex items-center gap-1 text-xs font-semibold text-nebula">
                <BadgeCheck className="h-4 w-4" /> Verified
              </span>
            </div>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-white sm:text-6xl">
              {username}
            </h1>
            <p className="mt-2 text-sm text-zinc-300">
              {songs.length} song{songs.length === 1 ? "" : "s"}
              {typeof artist.followersCount === "number" &&
                ` · ${artist.followersCount.toLocaleString()} followers`}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {songs.length > 0 && (
                <Button
                  onClick={() => {
                    if (current && songs.some((s) => s.id === current.id)) toggle();
                    else playQueue(songs, 0);
                  }}
                >
                  {isPlayingThisArtist ? (
                    <Pause className="fill-current" />
                  ) : (
                    <Play className="fill-current" />
                  )}
                  {isPlayingThisArtist ? "Pause" : "Play"}
                </Button>
              )}
              <Button
                variant={following ? "secondary" : "outline"}
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
              >
                {followMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {following ? "Following" : "Follow"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {artist.bio && (
        <div className="max-w-2xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
            About
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{artist.bio}</p>
        </div>
      )}

      {/* Popular */}
      {songs.length > 0 && (
        <SectionRail title="Popular" subtitle={`Top tracks by ${username}`}>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-2">
            {songs.slice(0, 10).map((song, i) => (
              <SongRow key={`${song.id ?? "song"}-${i}`} song={song} index={i} context={songs} showGenre />
            ))}
          </div>
        </SectionRail>
      )}

      {/* Discography */}
      {albums.length > 0 && (
        <SectionRail title="Discography" subtitle={`${albums.length} release${albums.length === 1 ? "" : "s"}`}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {albums.map((album) => (
              <div
                key={album.name}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.05]"
              >
                <Artwork seed={`${id}-${album.name}`} title={album.name} className="aspect-square w-full" />
                <h3 className="mt-3 truncate text-sm font-semibold text-white">
                  {album.name}
                </h3>
                <p className="text-xs text-zinc-500">
                  {album.count} track{album.count === 1 ? "" : "s"}
                </p>
              </div>
            ))}
          </div>
        </SectionRail>
      )}

      {songs.length === 0 && (
        <EmptyState
          title="No songs yet"
          description={`${username} hasn't released anything on Quasar yet.`}
        />
      )}
    </div>
  );
}
