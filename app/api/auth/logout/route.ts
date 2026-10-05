import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/server/auth";
import { errorResponse, sameOrigin } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return errorResponse("Request origin is not allowed.", 403);
  const response = NextResponse.json({ ok: true });
  clearSession(request, response);
  return response;
}
