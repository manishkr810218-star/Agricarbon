import { NextRequest, NextResponse } from "next/server";
import { userFromRequest } from "@/lib/server/auth";
import { farmSummary, getFarm, saveFarm } from "@/lib/server/farm";
import { errorResponse, jsonBody } from "@/lib/server/http";
import { farmUpdateSchema } from "@/lib/server/schema";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  return NextResponse.json(farmSummary(user.id), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function PUT(request: NextRequest) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  const result = farmUpdateSchema.safeParse(await jsonBody(request));
  if (!result.success)
    return errorResponse(
      result.error.issues[0]?.message || "Check your answers.",
    );
  return NextResponse.json(
    saveFarm(user.id, { ...getFarm(user.id), ...result.data }),
  );
}
