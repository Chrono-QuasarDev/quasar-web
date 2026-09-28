import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Quasar — Your Universe of Sound",
    template: "%s · Quasar",
  },
  description:
    "Quasar is a next-generation music streaming experience. Discover new releases, build playlists, follow artists, and stream in stunning quality.",
  keywords: ["music", "streaming", "playlists", "artists", "discovery"],
  openGraph: {
    title: "Quasar — Your Universe of Sound",
    description:
      "Discover new releases, build playlists, follow artists, and stream in stunning quality.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full bg-void font-sans text-zinc-100 antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
