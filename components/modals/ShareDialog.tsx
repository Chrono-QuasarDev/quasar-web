"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, Copy, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { Song } from "@/lib/types";
import { shareSong } from "@/lib/api/songs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Artwork } from "@/components/Artwork";

export function ShareDialog({
  song,
  open,
  onOpenChange,
}: {
  song: Song;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const link = `${appUrl}/songs/${song.id}`;

  const shareMutation = useMutation({
    mutationFn: () => shareSong(song.id),
    onError: () => {
      /* Non-blocking: link still works even if tracking fails */
    },
  });

  useEffect(() => {
    if (open) {
      setCopied(false);
      shareMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const nativeShare = async () => {
    const data = shareMutation.data?.data;
    const text = data
      ? `Listen to "${data.title}"${data.ArtistProfile?.User?.username ? ` by ${data.ArtistProfile.User.username}` : ""} on Quasar`
      : `Listen to "${song.title}" on Quasar`;
    if (navigator.share) {
      try {
        await navigator.share({ title: song.title, text, url: link });
      } catch {
        /* user dismissed */
      }
    } else {
      copy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this song</DialogTitle>
          <DialogDescription>
            Anyone with the link can open it in Quasar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <Artwork seed={song.id} title={song.title} className="h-12 w-12" rounded="rounded-lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {shareMutation.data?.data.title ?? song.title}
            </p>
            <p className="truncate text-xs text-zinc-400">
              {shareMutation.data?.data.ArtistProfile?.User?.username ??
                song.albumName}
              {shareMutation.data?.data.albumName
                ? ` · ${shareMutation.data.data.albumName}`
                : ""}
            </p>
          </div>
          {shareMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
          )}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5">
          <p className="flex-1 truncate font-mono text-xs text-zinc-300">{link}</p>
          <button
            onClick={copy}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/15"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <Button variant="secondary" className="w-full" onClick={nativeShare}>
          <Share2 /> Share via…
        </Button>
      </DialogContent>
    </Dialog>
  );
}
