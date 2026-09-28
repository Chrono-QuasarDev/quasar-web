import { apiFetch } from "./client";
import type { ApiSuccess, LoginData, User } from "@/lib/types";

export const authKeys = {
  all: ["auth"] as const,
};

export async function register(payload: {
  username: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; user: User }> {
  return apiFetch("/api/v1/auth/register", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<ApiSuccess<LoginData>> {
  return apiFetch("/api/v1/auth/login", {
    method: "POST",
    body: payload,
    auth: false,
  });
}
