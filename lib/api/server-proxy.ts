// SERVER ONLY — imported by Route Handlers, never by client components.
// Forwards same-origin /api/* requests to the real backend, eliminating
// CORS entirely (the backend is missing CORS headers on some routes).

import { NextRequest, NextResponse } from "next/server";

export const BACKEND_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

const FORWARD_HEADERS = ["authorization", "content-type", "range", "accept"];
const RETURN_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
];

export async function proxyToBackend(req: NextRequest, backendPath: string) {
  const url = `${BACKEND_URL}${backendPath}`;

  const headers = new Headers();
  for (const name of FORWARD_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await req.arrayBuffer();
    if (body.byteLength > 0) init.body = body;
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: `Could not reach the API at ${BACKEND_URL}. Is it running?`,
      },
      { status: 502 },
    );
  }

  const outHeaders = new Headers();
  for (const name of RETURN_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) outHeaders.set(name, value);
  }

  const body = await upstream.arrayBuffer();
  return new NextResponse(body.byteLength ? body : null, {
    status: upstream.status,
    headers: outHeaders,
  });
}
