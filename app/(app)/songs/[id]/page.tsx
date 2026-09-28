"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Disc3,
  ListPlus,
  ListVideo,
  Loader2,
  Pause,
  Play,
  Plus,
  Share2,
} from "lucide-react";
import { getSong, searchSongs, songKeys } from "@/lib/api/songs";
import { ApiError } from "@/lib/api/client";
import { artistDisplayName, formatDate, formatDuration, initials } from "@/lib/format";
import { usePlayerStore } from "@/stores/player-store";
import { pushRecent } from "@/lib/recent";
import { Artwork } from "@/components/Artwork";
import { SongCard } from "@/components/cards/SongCard";
import { SectionRail } from "@/components/cards/SectionRail";
import { AddToPlaylistDialog } from "@/components/modals/AddToPlaylistDialog";
import { ShareDialog } from "@/components/modals/ShareDialog";
import { EmptyState, ErrorState } from "@/components/states";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [addOpen, setAddOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const current = usePlayerStore((s) => s.current);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playSong = usePlayerStore((s) => s.playSong);
  const toggle = usePlayerStore((s) => s.toggle);

  const songQuery = useQuery({
    queryKey: songKeys.detail(id),
    queryFn: () => getSong(id),
  });

  const song = songQuery.data?.data;
  const isCurrent = current?.id === id;
  const playing = isCurrent && isPlaying;

  const relatedQuery = useQuery({
    queryKey: songKeys.search({ genre: song?.genre ?? "", size: 6 }),
    queryFn: () =>
      searchSongs({ genre: song?.genre ?? "", size: 6 }).then((res) => ({
        ...res,
        data: res.data.filter((s) => s.id !== id).slice(0, 5),
      })),
    enabled: !!song?.genre,
  });

  const related = relatedQuery.data?.data ?? [];

  const playNext = () => {
    if (!song) return;
    const { queue, index } = usePlayerStore.getState();
    const next = [...queue];
    next.splice(index + 1, 0, song);
    usePlayerStore.setState({ queue: next });
  };

  const addToQueue = () => {
    if (!song) return;
    const { queue, current: cur } = usePlayerStore.getState();
    if (!cur) {
      playSong(song);
      return;
    }
    usePlayerStore.setState({ queue: [...queue, song] });
  };

  if (songQuery.isLoading) {
    return (
      <div className="space-y-8 py-4">
        <div className="flex flex-col gap-6 sm:flex-row">
          <Skeleton className="h-56 w-56 shrink-0 rounded-3xl" />
          <div className="flex-1 space-y-3 pt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <div className="flex gap-2 pt-4">
              <Skeleton className="h-11 w-32 rounded-full" />
              <Skeleton className="h-11 w-11 rounded-full" />
              <Skeleton className="h-11 w-11 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (songQuery.isError) {
    const err = songQuery.error;
    if (err instanceof ApiError && err.isNotFound) {
      return (
        <div className="py-10">
          <EmptyState
            icon={<Disc3 className="h-5 w-5" />}
            title="Song not found"
            description="This track may have been removed, or the link is wrong."
            action={
              <Link href="/search" className="mt-2">
                <Button variant="secondary" size="sm">
                  Browse songs
                </Button>
              </Link>
            }
          />
        </div>
      );
    }
    return (
      <div className="py-10">
        <ErrorState onRetry={() => songQuery.refetch()} />
      </div>
    );
  }

  if (!song) return null;

  const profile = song.ArtistProfile;

  return (
    <div className="space-y-10 py-4">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div className="relative shrink-0">
          <Artwork
            seed={song.id}
            title={song.title}
            className="h-56 w-56 shadow-2xl shadow-black/50"
            rounded="rounded-3xl"
          />
          {playing && (
            <span className="absolute bottom-3 right-3 flex h-6 items-end gap-1 rounded-full bg-black/60 px-2.5 py-1.5 backdrop-blur">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="eq-bar w-1 rounded-full bg-accent" style={{ height: "100%" }} />
              ))}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Song</Badge>
            {song.genre && <Badge variant="secondary">{song.genre}</Badge>}
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
            {song.title}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {song.artistId ? (
              <Link
                href={`/artists/${song.artistId}`}
                className="font-semibold text-zinc-200 hover:text-accent hover:underline"
              >
                {artistDisplayName(song)}
              </Link>
            ) : (
              <span className="font-semibold text-zinc-200">
                {artistDisplayName(song)}
              </span>
            )}
            {song.albumName ? ` · ${song.albumName}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(song.releaseDate)}
            </span>
            <span className="tabular-nums">{formatDuration(song.durationMs)}</span>
            {typeof song.trackNumber === "number" && (
              <span>Track {song.trackNumber}</span>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button
              size="lg"
              onClick={() => {
                if (isCurrent) toggle();
                else {
                  playSong(song);
                  pushRecent(song);
                }
              }}
            >
              {songQuery.isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : playing ? (
                <Pause className="fill-current" />
              ) : (
                <Play className="fill-current" />
              )}
              {playing ? "Pause" : "Play"}
            </Button>
            <Button variant="secondary" size="icon" title="Add to playlist" onClick={() => setAddOpen(true)}>
              <Plus />
            </Button>
            <Button variant="secondary" size="icon" title="Play next" onClick={playNext}>
              <ListVideo />
            </Button>
            <Button variant="secondary" size="icon" title="Add to queue" onClick={addToQueue}>
              <ListPlus />
            </Button>
            <Button variant="secondary" size="icon" title="Share" onClick={() => setShareOpen(true)}>
              <Share2 />
            </Button>
          </div>
        </div>
      </div>

      {profile && (
        <SectionRail title="Artist" subtitle="About the performer">
          <Link
            href={`/artists/${song.artistId ?? profile.id}`}
            className="group flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 transition-colors hover:border-white/10 hover:bg-white/[0.04]"
          >
            <Avatar className="h-16 w-16 shrink-0">
              {profile.profilePictureUrl && (
                <AvatarImage
                  src={profile.profilePictureUrl}
                  alt={artistDisplayName(song)}
                />
              )}
              <AvatarFallback className="text-xl">
                {initials(artistDisplayName(song))}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0">
              <span className="block truncate text-base font-bold text-white group-hover:underline">
                {artistDisplayName(song)}
              </span>
              {profile.bio ? (
                <span className="mt-0.5 line-clamp-2 block text-sm text-zinc-400">
                  {profile.bio}
                </span>
              ) : (
                <span className="mt-0.5 block text-sm text-zinc-500">
                  View artist profile
                </span>
              )}
            </span>
          </Link>
        </SectionRail>
      )}

      {relatedQuery.isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <SectionRail
          title={`More ${song.genre ?? "music"}`}
          subtitle="Because you played this"
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((s, i) => (
              <SongCard key={`${s.id ?? "song"}-${i}`} song={s} context={related} />
            ))}
          </div>
        </SectionRail>
      )}

      <AddToPlaylistDialog song={song} open={addOpen} onOpenChange={setAddOpen} />
      <ShareDialog song={song} open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}
