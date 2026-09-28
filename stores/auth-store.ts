"use client";

import { create } from "zustand";
import { TOKEN_KEY, setTokenCookie } from "@/lib/api/client";
import type { User } from "@/lib/types";

const USER_KEY = "quasar-user";

function readInitial(): { user: User | null; token: string | null } {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    const token = window.localStorage.getItem(TOKEN_KEY);
    const rawUser = window.localStorage.getItem(USER_KEY);
    return {
      token,
      user: rawUser ? (JSON.parse(rawUser) as User) : null,
    };
  } catch {
    return { user: null, token: null };
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => {
  const initial = readInitial();
  return {
    user: initial.user,
    token: initial.token,
    isAuthenticated: Boolean(initial.token),
    setSession: (user, token) => {
      try {
        window.localStorage.setItem(TOKEN_KEY, token);
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
        setTokenCookie(token);
      } catch {
        /* storage unavailable */
      }
      set({ user, token, isAuthenticated: true });
    },
    setUser: (user) => {
      try {
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch {
        /* ignore */
      }
      set({ user });
    },
    logout: () => {
      try {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
        setTokenCookie(null);
      } catch {
        /* ignore */
      }
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
