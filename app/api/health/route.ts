import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/server-proxy";

// Same-origin gateway: /api/health -> <backend>/health
// (The backend's /health route lacks CORS headers, so browsers can't hit it
// directly — the server-side proxy has no such restriction.)

export async function GET(req: NextRequest) {
  return proxyToBackend(req, `/health${req.nextUrl.search}`);
}
