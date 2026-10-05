import { NextRequest, NextResponse } from "next/server";
import { userFromRequest } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { farmSummary } from "@/lib/server/farm";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  const group = getDb()
    .prepare("SELECT id, name, owner_user_id FROM farmer_groups WHERE id = ?")
    .get((await context.params).id) as
    { id: string; name: string; owner_user_id: string } | undefined;
  if (!group) return errorResponse("Group not found.", 404);
  if (group.owner_user_id !== user.id)
    return errorResponse(
      "Only the group organizer can view member readiness.",
      403,
    );
  const rows = getDb()
    .prepare(
      `SELECT u.id, u.name FROM group_members gm JOIN users u ON u.id = gm.user_id
    WHERE gm.group_id = ? ORDER BY u.name`,
    )
    .all(group.id) as { id: string; name: string }[];
  const members = rows.map((row) => {
    const { farm, assessment } = farmSummary(row.id);
    return {
      name: row.name,
      village: farm.village,
      area: Number(farm.area) || 0,
      score: assessment.score,
      level: assessment.level,
      topGap: assessment.gaps[0]?.title || null,
    };
  });
  const totalArea = members.reduce((sum, item) => sum + item.area, 0);
  const averageScore = members.length
    ? Math.round(
        members.reduce((sum, item) => sum + item.score, 0) / members.length,
      )
    : 0;
  const commonGaps = Object.entries(
    members.reduce<Record<string, number>>((counts, member) => {
      if (member.topGap)
        counts[member.topGap] = (counts[member.topGap] || 0) + 1;
      return counts;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([title, count]) => ({ title, count }));
  return NextResponse.json(
    {
      group: { id: group.id, name: group.name },
      members,
      summary: { count: members.length, totalArea, averageScore, commonGaps },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
