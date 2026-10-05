import { NextRequest, NextResponse } from "next/server";
import { userFromRequest } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { farmSummary } from "@/lib/server/farm";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  const { id } = await context.params;
  const result = getDb()
    .prepare("DELETE FROM crop_records WHERE id = ? AND user_id = ?")
    .run(id, user.id);
  if (!result.changes) return errorResponse("Crop record not found.", 404);
  return NextResponse.json(farmSummary(user.id));
}
