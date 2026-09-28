// Central API client: JWT injection, error normalization, 401 handling.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// All browser API traffic goes through the same-origin Next.js gateway
// (/api/v1/* and /api/health proxy to the backend server-side), so CORS
// misconfiguration on the backend can never break the app.
function toSameOrigin(path: string): string {
  if (path === "/health" || path.startsWith("/health?")) return `/api${path}`;
  return path; // /api/v1/... is served by app/api/v1/[...path]/route.ts
}

export const TOKEN_KEY = "quasar-token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setTokenCookie(token: string | null) {
  if (typeof document === "undefined") return;
  if (token) {
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  } else {
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
  get isForbidden() {
    return this.status === 403;
  }
  get isNotFound() {
    return this.status === 404;
  }
  get isConflict() {
    return this.status === 409;
  }
  get isValidation() {
    return this.status === 400 || this.status === 422;
  }
}

function notifyUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("quasar:unauthorized"));
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(toSameOrigin(path), {
      ...rest,
      headers: finalHeaders,
      body:
        body === undefined || body instanceof FormData
          ? (body as BodyInit | undefined)
          : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Could not reach the API. Is it running?");
  }

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload: unknown = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      (payload as { message?: string } | null)?.message ??
      (payload as { error?: string } | null)?.error ??
      `Request failed (${res.status})`;
    if (res.status === 401 && auth) notifyUnauthorized();
    throw new ApiError(res.status, message, payload);
  }

  // Some backends answer 2xx with { success: false } — never treat that as a
  // success (it would show a fake "Added" toast while nothing happened).
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as { success?: unknown }).success === false
  ) {
    const message =
      (payload as { message?: string }).message ?? "Request failed";
    throw new ApiError(res.status, message, payload);
  }

  return payload as T;
}

export function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}
