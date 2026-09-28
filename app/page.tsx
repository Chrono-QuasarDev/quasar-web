"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AudioWaveform,
  Compass,
  ListMusic,
  Play,
  Radio,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { Artwork } from "@/components/Artwork";

const FEATURES = [
  {
    icon: Radio,
    title: "Lossless-feel streaming",
    description:
      "Range-request streaming with instant seek, gapless queue, and OS-level media controls.",
  },
  {
    icon: Compass,
    title: "Discovery that slaps",
    description:
      "Fresh releases from the last 30 days, sortable and paginated. Never miss a drop.",
  },
  {
    icon: ListMusic,
    title: "Playlists in seconds",
    description:
      "Create, rename, and curate with per-user uniqueness and owner-only controls.",
  },
  {
    icon: Users,
    title: "Follow artists",
    description:
      "One tap to follow. Artist pages with bios, popular tracks, and discography.",
  },
  {
    icon: Share2,
    title: "Shareable everything",
    description:
      "Every song generates a rich share link with artist and album context.",
  },
  {
    icon: Sparkles,
    title: "Command-K everything",
    description:
      "Blazing global search across songs, albums, and genres. Keyboard-first.",
  },
];

const DEMO_TRACKS = [
  { id: "demo-1", title: "Midnight Drive" },
  { id: "demo-2", title: "Neon Skyline" },
  { id: "demo-3", title: "Solar Winds" },
  { id: "demo-4", title: "Echo Chamber" },
  { id: "demo-5", title: "Gravity Waves" },
  { id: "demo-6", title: "Afterglow" },
];

export default function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) router.replace("/home");
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-void text-white">
      {/* Nav */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-black shadow-lg shadow-accent/25">
            <AudioWaveform className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-black tracking-tight">Quasar</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/register">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="aurora-bg relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              Now streaming · New releases daily
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 text-5xl font-black leading-[1.02] tracking-tighter sm:text-6xl lg:text-7xl"
            >
              Your universe
              <br />
              of <span className="text-accent">sound.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg"
            >
              Quasar is a precision-built music streaming experience — search
              anything, stream instantly, curate playlists, and follow the
              artists shaping your orbit.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link href="/register">
                <Button size="lg">
                  <Play className="fill-current" /> Start listening free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  I have an account
                </Button>
              </Link>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-xs text-zinc-500"
            >
              Free forever · No credit card · Your library syncs instantly
            </motion.p>
          </div>

          {/* Floating player mock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="relative hidden lg:block"
          >
            <div className="glass rounded-3xl border border-white/10 p-5 shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Trending now
                </p>
                <span className="flex h-4 items-end gap-[3px]" aria-hidden>
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="eq-bar w-1 rounded-full bg-accent"
                      style={{ height: "100%" }}
                    />
                  ))}
                </span>
              </div>
              <div className="mt-4 space-y-1">
                {DEMO_TRACKS.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5"
                  >
                    <Artwork seed={t.id} title={t.title} className="h-11 w-11" rounded="rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{t.title}</p>
                      <p className="text-xs text-zinc-500">
                        Quasar Collective · Single
                      </p>
                    </div>
                    <span className="text-xs tabular-nums text-zinc-600">
                      3:{(17 + i * 7).toString().slice(-2)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-2xl border border-white/10 bg-panel px-4 py-3 shadow-xl">
              <p className="text-xs text-zinc-500">Now playing</p>
              <p className="text-sm font-bold text-accent">Midnight Drive</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Built like an instrument.
          <br />
          <span className="text-zinc-500">Tuned like an obsession.</span>
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 3) * 0.08 }}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="aurora-bg overflow-hidden rounded-3xl border border-white/10 p-10 text-center sm:p-14">
          <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
            Press play on something new.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400 sm:text-base">
            Join Quasar free and build your orbit of sound in under a minute.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Create free account</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Log in
              </Button>
            </Link>
          </div>
        </div>
        <footer className="mt-10 flex flex-col items-center gap-2 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <AudioWaveform className="h-4 w-4" />
            <span className="font-bold text-zinc-500">Quasar</span>
          </div>
          <p>Crafted for listeners · Powered by the Quasar API</p>
        </footer>
      </section>
    </div>
  );
}
