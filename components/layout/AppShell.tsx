"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { Player } from "@/components/player/Player";
import { CommandPalette } from "@/components/search/CommandPalette";
import { usePlayerStore } from "@/stores/player-store";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const current = usePlayerStore((s) => s.current);

  return (
    <div className="flex min-h-screen bg-void text-zinc-100">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <TopBar />
        <main
          className={cn(
            "mx-auto w-full max-w-6xl flex-1 px-4 pb-40 sm:px-6 lg:pb-36",
            !current && "pb-28 lg:pb-12",
          )}
        >
          {children}
        </main>
      </div>
      <MobileNav />
      <Player />
      <CommandPalette />
    </div>
  );
}
