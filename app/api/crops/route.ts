import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { userFromRequest } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { farmSummary } from "@/lib/server/farm";
import { errorResponse, jsonBody } from "@/lib/server/http";
import { cropRecordSchema } from "@/lib/server/schema";

export const runtime = "nodejs";

export type CropRecord = {
  id: string;
  year: number;
  season: string;
  crop: string;
  tillage: string;
  irrigation: string;
  input_notes: string;
  water_notes: string;
  created_at: string;
};

export async function GET(request: NextRequest) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  const records = getDb()
    .prepare(
      `SELECT id, year, season, crop, tillage, irrigation, input_notes, water_notes, created_at
    FROM crop_records WHERE user_id = ? ORDER BY year DESC, created_at DESC`,
    )
    .all(user.id) as CropRecord[];
  return NextResponse.json(
    { records },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  const result = cropRecordSchema.safeParse(await jsonBody(request));
  if (!result.success)
    return errorResponse(
      result.error.issues[0]?.message || "Check your crop record.",
    );
  const d = result.data;
  const id = randomUUID();
  getDb()
    .prepare(
      `INSERT INTO crop_records
    (id, user_id, year, season, crop, tillage, irrigation, input_notes, water_notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      user.id,
      d.year,
      d.season,
      d.crop,
      d.tillage,
      d.irrigation,
      d.inputNotes,
      d.waterNotes,
      new Date().toISOString(),
    );
  return NextResponse.json({ id, ...farmSummary(user.id) }, { status: 201 });
}
