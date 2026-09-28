"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ListPlus,
  ListVideo,
  Play,
  Plus,
  Share2,
  Disc3,
  User,
} from "lucide-react";
import type { Song } from "@/lib/types";
import { usePlayerStore } from "@/stores/player-store";
import { pushRecent } from "@/lib/recent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddToPlaylistDialog } from "@/components/modals/AddToPlaylistDialog";
import { ShareDialog } from "@/components/modals/ShareDialog";

export function SongMenu({
  song,
  trigger,
}: {
  song: Song;
  trigger: ReactNode;
}) {
  const router = useRouter();
  const playSong = usePlayerStore((s) => s.playSong);
  const [addOpen, setAddOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const playNext = () => {
    const { queue, index } = usePlayerStore.getState();
    const next = [...queue];
    next.splice(index + 1, 0, song);
    usePlayerStore.setState({
      queue: next,
      ...(next.length === 1
        ? { current: song, index: 0, isPlaying: true }
        : {}),
    });
  };

  const addToQueue = () => {
    const { queue, current } = usePlayerStore.getState();
    if (!current) {
      playSong(song);
      return;
    }
    usePlayerStore.setState({ queue: [...queue, song] });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => {
              playSong(song);
              pushRecent(song);
            }}
          >
            <Play /> Play
          </DropdownMenuItem>
          <DropdownMenuItem onClick={playNext}>
            <ListVideo /> Play next
          </DropdownMenuItem>
          <DropdownMenuItem onClick={addToQueue}>
            <ListPlus /> Add to queue
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setAddOpen(true)}>
            <Plus /> Add to playlist
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShareOpen(true)}>
            <Share2 /> Share
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(`/songs/${song.id}`)}>
            <Disc3 /> Go to song
          </DropdownMenuItem>
          {song.artistId && (
            <DropdownMenuItem
              onClick={() => router.push(`/artists/${song.artistId}`)}
            >
              <User /> Go to artist
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AddToPlaylistDialog
        song={song}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
      <ShareDialog song={song} open={shareOpen} onOpenChange={setShareOpen} />
    </>
  );
}
