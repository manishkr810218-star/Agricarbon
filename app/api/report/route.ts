import { NextRequest, NextResponse } from "next/server";
import { matchProgramPaths } from "@/lib/programs";
import { userFromRequest } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { farmSummary } from "@/lib/server/farm";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  const { farm, assessment } = farmSummary(user.id);
  const cropRecords = getDb()
    .prepare(
      `SELECT year, season, crop, tillage, irrigation, input_notes, water_notes
    FROM crop_records WHERE user_id = ? ORDER BY year DESC`,
    )
    .all(user.id);
  const documents = getDb()
    .prepare(
      `SELECT kind, original_name, created_at
    FROM documents WHERE user_id = ? ORDER BY created_at DESC`,
    )
    .all(user.id);
  const body = {
    generatedAt: new Date().toISOString(),
    farmer: {
      name: farm.name,
      village: farm.village,
      district: farm.district,
      state: farm.state,
      areaAcres: farm.area,
    },
    assessment,
    cropRecords,
    documents,
    possiblePaths: matchProgramPaths(farm),
    disclaimer:
      "Readiness guidance only. This report does not establish carbon-credit eligibility or verification.",
  };
  const download = request.nextUrl.searchParams.get("download") === "1";
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "private, no-store",
      ...(download
        ? {
            "Content-Disposition":
              "attachment; filename=agricarbon-readiness.json",
          }
        : {}),
    },
  });
}
