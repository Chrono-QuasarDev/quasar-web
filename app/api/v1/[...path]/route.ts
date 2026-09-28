import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/server-proxy";

// Same-origin gateway: /api/v1/* -> <backend>/api/v1/*
// Forwards method, query, Authorization, and bodies. Passes status through
// so the client keeps its 401/403/404 handling.

function target(req: NextRequest): string {
  return `${req.nextUrl.pathname}${req.nextUrl.search}`;
}

export async function GET(req: NextRequest) {
  return proxyToBackend(req, target(req));
}

export async function POST(req: NextRequest) {
  return proxyToBackend(req, target(req));
}

export async function PUT(req: NextRequest) {
  return proxyToBackend(req, target(req));
}

export async function PATCH(req: NextRequest) {
  return proxyToBackend(req, target(req));
}

export async function DELETE(req: NextRequest) {
  return proxyToBackend(req, target(req));
}
