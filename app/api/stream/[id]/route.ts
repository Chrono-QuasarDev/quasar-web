import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/api/server-proxy";

// Proxies authenticated audio so <audio> can stream without exposing the JWT.
// Forwards Range headers for seeking.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const apiUrl = BACKEND_URL;
  const token = req.cookies.get("quasar-token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  const range = req.headers.get("range");
  if (range) headers["Range"] = range;

  let upstream: Response;
  try {
    upstream = await fetch(`${apiUrl}/api/v1/songs/${id}/stream`, {
      headers,
    });
  } catch {
    return NextResponse.json(
      { message: "Could not reach the API" },
      { status: 502 },
    );
  }

  if (!upstream.ok && upstream.status !== 206 && upstream.status !== 416) {
    return NextResponse.json(
      { message: `Stream failed (${upstream.status})` },
      { status: upstream.status },
    );
  }

  const outHeaders = new Headers();
  for (const h of [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
  ]) {
    const v = upstream.headers.get(h);
    if (v) outHeaders.set(h, v);
  }
  if (!outHeaders.has("content-type"))
    outHeaders.set("content-type", "audio/mpeg");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}
