import { NextRequest, NextResponse } from "next/server";
import { matchProgramPaths } from "@/lib/programs";
import { userFromRequest } from "@/lib/server/auth";
import { getFarm } from "@/lib/server/farm";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  return NextResponse.json(
    {
      paths: matchProgramPaths(getFarm(user.id)),
      note: "These are possible pathways, not live program offers or acceptance decisions.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
