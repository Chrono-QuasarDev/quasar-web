"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

function UnauthorizedListener() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const handler = () => {
      logout();
      router.replace("/login");
    };
    window.addEventListener("quasar:unauthorized", handler);
    return () => window.removeEventListener("quasar:unauthorized", handler);
  }, [logout, router]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>
        <UnauthorizedListener />
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#131316",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#f4f4f5",
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
