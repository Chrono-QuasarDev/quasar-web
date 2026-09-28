"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Library, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t border-white/10 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 lg:hidden">
      <div className="grid grid-cols-4">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/home" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold",
                active ? "text-accent" : "text-zinc-500",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
