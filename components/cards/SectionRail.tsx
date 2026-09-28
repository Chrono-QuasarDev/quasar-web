"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SectionRail({
  title,
  subtitle,
  href,
  actionLabel = "Show all",
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-sm text-zinc-400">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 transition-colors hover:text-accent"
          >
            {actionLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
