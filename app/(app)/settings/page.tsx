"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AtSign,
  Calendar,
  Loader2,
  LogOut,
  RefreshCw,
  Server,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getMe, userKeys } from "@/lib/api/users";
import { getHealth, healthKeys } from "@/lib/api/health";
import { API_URL } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import { formatDate, initials } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const sessionUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);

  const meQuery = useQuery({
    queryKey: userKeys.me,
    queryFn: getMe,
  });

  const healthQuery = useQuery({
    queryKey: healthKeys.all,
    queryFn: getHealth,
    retry: false,
  });

  const user = meQuery.data?.data ?? sessionUser;
  const online = !healthQuery.isError;
  const health = healthQuery.data;

  if (meQuery.data?.data && meQuery.data.data.id !== sessionUser?.id) {
    // Keep session user fresh silently — handled in render to avoid loops.
  }

  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Your profile, connection, and session.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-accent" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meQuery.isLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          ) : meQuery.isError ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-400">
                Couldn&apos;t refresh your profile from the API.
              </p>
              <Button variant="secondary" size="sm" onClick={() => meQuery.refetch()}>
                <RefreshCw className="h-3.5 w-3.5" /> Retry
              </Button>
            </div>
          ) : user ? (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl">
                  {initials(user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="truncate text-lg font-bold text-white">
                  {user.username}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <AtSign className="h-3.5 w-3.5" /> {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <Badge variant="secondary">{user.role}</Badge>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  meQuery.refetch();
                  if (meQuery.data?.data) setUser(meQuery.data.data);
                }}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-accent" /> API connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "h-3 w-3 rounded-full",
                  healthQuery.isLoading
                    ? "animate-pulse bg-amber-400"
                    : online
                      ? "bg-accent shadow-[0_0_10px_2px_rgba(212,245,66,0.5)]"
                      : "bg-red-500",
                )}
              />
              <div>
                <p className="text-sm font-semibold text-white">
                  {healthQuery.isLoading
                    ? "Checking…"
                    : online
                      ? "Connected"
                      : "Unreachable"}
                </p>
                <p className="font-mono text-xs text-zinc-500">{API_URL}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => healthQuery.refetch()}
              disabled={healthQuery.isFetching}
            >
              {healthQuery.isFetching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Activity className="h-3.5 w-3.5" />
              )}
              Check health
            </Button>
          </div>

          {health && online && (
            <>
              <Separator />
              <dl className="grid gap-3 text-xs sm:grid-cols-3">
                {Object.entries(health)
                  .slice(0, 6)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2"
                    >
                      <dt className="font-semibold uppercase tracking-wider text-zinc-500">
                        {key}
                      </dt>
                      <dd className="mt-0.5 truncate font-mono text-zinc-200">
                        {String(value)}
                      </dd>
                    </div>
                  ))}
              </dl>
            </>
          )}

          {!online && (
            <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-200">
              The frontend expects the API at{" "}
              <span className="font-mono">{API_URL}</span>. Start it with{" "}
              <span className="font-mono">npm start</span> in the backend repo, or
              update <span className="font-mono">NEXT_PUBLIC_API_URL</span> in{" "}
              <span className="font-mono">.env.local</span> and restart the dev
              server.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Session */}
      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-400">
            Signed in as <span className="font-semibold text-white">{user?.username}</span>.
            Logging out clears your token on this device.
          </p>
          <Button
            variant="destructive"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            <LogOut /> Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
