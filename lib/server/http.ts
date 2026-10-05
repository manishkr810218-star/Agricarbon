import { NextResponse } from "next/server";

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const from = new URL(origin);
    const target = new URL(request.url);
    const host = request.headers.get("host") || target.host;
    const scheme =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      target.protocol.slice(0, -1);
    return from.host === host && from.protocol === scheme + ":";
  } catch {
    return false;
  }
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function jsonBody(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    return null;
  }
}
