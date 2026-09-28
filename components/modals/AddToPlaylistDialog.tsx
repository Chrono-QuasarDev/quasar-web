"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListMusic, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Song } from "@/lib/types";
import {
  addSongToPlaylist,
  createPlaylist,
  listPlaylists,
  playlistKeys,
} from "@/lib/api/playlists";
import { ApiError } from "@/lib/api/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Artwork } from "@/components/Artwork";

export function AddToPlaylistDialog({
  song,
  open,
  onOpenChange,
}: {
  song: Song;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const playlistsQuery = useQuery({
    queryKey: playlistKeys.list,
    queryFn: listPlaylists,
    enabled: open,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: playlistKeys.all });
  };

  const addMutation = useMutation({
    mutationFn: (playlistId: string) => addSongToPlaylist(playlistId, song.id),
    onSuccess: (_, playlistId) => {
      toast.success("Added to playlist");
      queryClient.invalidateQueries({
        queryKey: playlistKeys.detail(playlistId),
      });
      invalidate();
      onOpenChange(false);
    },
    onError: (err) => {
      const message =
        err instanceof ApiError ? err.message : "Could not add song";
      toast.error(message);
    },
  });

  const createMutation = useMutation({
    mutationFn: (playlistName: string) => createPlaylist(playlistName),
    onSuccess: async (res) => {
      try {
        await addSongToPlaylist(res.data.id, song.id);
        toast.success(`Created "${res.data.name}" and added song`);
      } catch {
        toast.success(`Created "${res.data.name}"`);
      }
      setName("");
      setCreating(false);
      invalidate();
      onOpenChange(false);
    },
    onError: (err) => {
      const message =
        err instanceof ApiError ? err.message : "Could not create playlist";
      toast.error(message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to playlist</DialogTitle>
          <DialogDescription>
            Save “{song.title}” to one of your playlists.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
          {playlistsQuery.isLoading && (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          )}
          {playlistsQuery.isError && (
            <p className="py-4 text-center text-sm text-zinc-400">
              Couldn&apos;t load playlists.
            </p>
          )}
          {playlistsQuery.data?.data.map((p) => (
            <button
              key={p.id}
              disabled={addMutation.isPending}
              onClick={() => addMutation.mutate(p.id)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.06] disabled:opacity-50"
            >
              <Artwork seed={p.id} title={p.name} className="h-10 w-10" rounded="rounded-lg" />
              <span className="flex-1 truncate text-sm font-medium text-white">
                {p.name}
              </span>
              {addMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              ) : (
                <Plus className="h-4 w-4 text-zinc-500" />
              )}
            </button>
          ))}
          {playlistsQuery.data?.data.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <ListMusic className="h-8 w-8 text-zinc-600" />
              <p className="text-sm text-zinc-400">
                No playlists yet — create one below.
              </p>
            </div>
          )}
        </div>

        {creating ? (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) createMutation.mutate(name.trim());
            }}
          >
            <Input
              autoFocus
              placeholder="New playlist name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
            <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </form>
        ) : (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setCreating(true)}
          >
            <Plus /> New playlist
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
