"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AudioWaveform,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { getHealth, healthKeys } from "@/lib/api/health";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { openCommandPalette } from "@/components/search/CommandPalette";
import { cn } from "@/lib/utils";

export function TopBar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const healthQuery = useQuery({
    queryKey: healthKeys.all,
    queryFn: getHealth,
    refetchInterval: 60_000,
    retry: false,
  });

  const online = !healthQuery.isError;

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void via-void/80 to-transparent" />
      <div className="relative flex w-full items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-black">
            <AudioWaveform className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="rounded-full bg-black/40 p-2 text-zinc-400 backdrop-blur transition-colors hover:text-white cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => router.forward()}
            aria-label="Go forward"
            className="rounded-full bg-black/40 p-2 text-zinc-400 backdrop-blur transition-colors hover:text-white cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <button
          onClick={openCommandPalette}
          className="flex h-10 max-w-md flex-1 cursor-pointer items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 text-sm text-zinc-500 backdrop-blur transition-colors hover:border-white/20 hover:text-zinc-300"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate text-left">
            Search songs, albums, genres…
          </span>
          <kbd className="hidden rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-zinc-500 sm:block">
            ⌘K
          </kbd>
        </button>

        <div className="flex-1" />

        <div
          title={online ? "API connected" : "API unreachable"}
          className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur sm:flex"
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              online ? "bg-accent shadow-[0_0_8px_2px_rgba(212,245,66,0.5)]" : "bg-red-500",
            )}
          />
          <span className="text-xs font-medium text-zinc-400">
            {online ? "Online" : "Offline"}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{initials(user?.username)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block truncate text-sm normal-case tracking-normal text-white">
                {user?.username ?? "Listener"}
              </span>
              <span className="block truncate text-xs font-normal normal-case tracking-normal text-zinc-500">
                {user?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <User /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="text-red-400 focus:text-red-300"
            >
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
