import { apiFetch } from "./client";

export const healthKeys = {
  all: ["health"] as const,
};

export interface HealthResponse {
  success?: boolean;
  status?: string;
  uptime?: number;
  message?: string;
  [key: string]: unknown;
}

export async function getHealth() {
  return apiFetch<HealthResponse>("/health", { auth: false });
}
