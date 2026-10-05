import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { emptyFarm } from "@/lib/readiness";
import { createSession, hashPassword, normalizePhone } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { errorResponse, jsonBody } from "@/lib/server/http";
import { registerSchema } from "@/lib/server/schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const result = registerSchema.safeParse(await jsonBody(request));
  if (!result.success)
    return errorResponse(
      result.error.issues[0]?.message || "Check your details.",
    );
  const data = result.data;
  const phone = normalizePhone(data.phone);
  if (phone.length < 10 || phone.length > 15)
    return errorResponse("Enter a valid mobile number.");
  const db = getDb();
  if (db.prepare("SELECT 1 FROM users WHERE phone = ?").get(phone)) {
    return errorResponse(
      "This mobile number already has an account. Please sign in.",
      409,
    );
  }

  const userId = randomUUID();
  const createdAt = new Date().toISOString();
  const farm = {
    ...emptyFarm,
    name: data.name,
    village: data.village,
    district: data.district,
    state: data.state,
    area: data.area,
    tenure: data.tenure,
  };
  const passwordHash = hashPassword(data.password);
  try {
    db.transaction(() => {
      db.prepare(
        "INSERT INTO users (id, name, phone, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
      ).run(userId, data.name, phone, passwordHash, createdAt);
      db.prepare(
        "INSERT INTO farms (user_id, data, updated_at) VALUES (?, ?, ?)",
      ).run(userId, JSON.stringify(farm), createdAt);
    })();
  } catch {
    return errorResponse("Account could not be created. Try again.", 409);
  }
  const response = NextResponse.json(
    { user: { id: userId, name: data.name, phone }, farm },
    { status: 201 },
  );
  createSession(userId, response, request);
  return response;
}
