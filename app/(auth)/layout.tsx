import Link from "next/link";
import { AudioWaveform } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="aurora-bg flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-black shadow-lg shadow-accent/25">
            <AudioWaveform className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-black tracking-tight text-white">
            Quasar
          </span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        {children}
      </main>
    </div>
  );
}
