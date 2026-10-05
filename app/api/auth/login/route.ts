import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  normalizePhone,
  verifyPassword,
} from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { errorResponse, jsonBody, sameOrigin } from "@/lib/server/http";
import { loginSchema } from "@/lib/server/schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return errorResponse("Request origin is not allowed.", 403);
  const result = loginSchema.safeParse(await jsonBody(request));
  if (!result.success)
    return errorResponse("Enter your mobile number and password.");
  const row = getDb()
    .prepare("SELECT id, name, phone, password_hash FROM users WHERE phone = ?")
    .get(normalizePhone(result.data.phone)) as
    | { id: string; name: string; phone: string; password_hash: string }
    | undefined;
  if (!row || !verifyPassword(result.data.password, row.password_hash)) {
    return errorResponse("Incorrect mobile number or password.", 401);
  }
  const response = NextResponse.json({
    user: { id: row.id, name: row.name, phone: row.phone },
  });
  createSession(row.id, response, request);
  return response;
}
