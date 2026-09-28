"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Playlist } from "@/lib/types";
import {
  createPlaylist,
  deletePlaylist,
  playlistKeys,
  updatePlaylist,
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

export function CreatePlaylistDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (p: Playlist) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName("");
  }, [open ]);

  const mutation = useMutation({
    mutationFn: (playlistName: string) => createPlaylist(playlistName),
    onSuccess: (res) => {
      toast.success(`Playlist "${res.data.name}" created`);
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
      onOpenChange(false);
      onCreated?.(res.data);
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Could not create playlist",
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New playlist</DialogTitle>
          <DialogDescription>
            Give your playlist a name. Names must be unique per user.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) mutation.mutate(name.trim());
          }}
        >
          <Input
            autoFocus
            placeholder="e.g. Midnight Drive"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !name.trim()}>
              {mutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Create playlist
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditPlaylistDialog({
  playlist,
  open,
  onOpenChange,
}: {
  playlist: Playlist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(playlist.name);

  useEffect(() => {
    if (open) setName(playlist.name);
  }, [open, playlist.name]);

  const mutation = useMutation({
    mutationFn: (playlistName: string) =>
      updatePlaylist(playlist.id, playlistName),
    onSuccess: (res) => {
      toast.success("Playlist renamed");
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
      queryClient.setQueryData(playlistKeys.detail(playlist.id), res);
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Could not rename playlist",
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename playlist</DialogTitle>
          <DialogDescription>Only the owner can rename this.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim() && name.trim() !== playlist.name)
              mutation.mutate(name.trim());
            else onOpenChange(false);
          }}
        >
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !name.trim()}>
              {mutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeletePlaylistDialog({
  playlist,
  open,
  onOpenChange,
  onDeleted,
}: {
  playlist: Playlist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deletePlaylist(playlist.id),
    onSuccess: () => {
      toast.success(`Deleted "${playlist.name}"`);
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
      onOpenChange(false);
      onDeleted?.();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Could not delete playlist",
      );
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete playlist?</DialogTitle>
          <DialogDescription>
            “{playlist.name}” will be permanently deleted. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
