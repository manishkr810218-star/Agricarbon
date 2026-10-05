import { randomBytes, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { userFromRequest } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { errorResponse, jsonBody } from "@/lib/server/http";
import { groupSchema } from "@/lib/server/schema";

export const runtime = "nodejs";

export type FarmerGroup = {
  id: string;
  name: string;
  invite_code: string | null;
  owner_user_id: string;
  created_at: string;
  member_count: number;
};

export async function GET(request: NextRequest) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  const groups = getDb()
    .prepare(
      `SELECT g.id, g.name,
      CASE WHEN g.owner_user_id = ? THEN g.invite_code ELSE NULL END AS invite_code,
      g.owner_user_id, g.created_at,
      (SELECT COUNT(*) FROM group_members gm2 WHERE gm2.group_id = g.id) AS member_count
    FROM farmer_groups g JOIN group_members gm ON gm.group_id = g.id
    WHERE gm.user_id = ? ORDER BY g.created_at DESC`,
    )
    .all(user.id, user.id) as FarmerGroup[];
  return NextResponse.json(
    { groups },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  const result = groupSchema.safeParse(await jsonBody(request));
  if (!result.success)
    return errorResponse("Enter a group name or valid invite code.");
  const db = getDb();
  if (result.data.action === "join") {
    const group = db
      .prepare("SELECT id, name FROM farmer_groups WHERE invite_code = ?")
      .get(result.data.code) as { id: string; name: string } | undefined;
    if (!group) return errorResponse("Invite code not found.", 404);
    db.prepare(
      "INSERT OR IGNORE INTO group_members (group_id, user_id, joined_at) VALUES (?, ?, ?)",
    ).run(group.id, user.id, new Date().toISOString());
    return NextResponse.json({ group });
  }
  const id = randomUUID();
  const code = randomBytes(6).toString("hex").toUpperCase();
  const createdAt = new Date().toISOString();
  const groupName = result.data.name;
  db.transaction(() => {
    db.prepare(
      "INSERT INTO farmer_groups (id, name, invite_code, owner_user_id, created_at) VALUES (?, ?, ?, ?, ?)",
    ).run(id, groupName, code, user.id, createdAt);
    db.prepare(
      "INSERT INTO group_members (group_id, user_id, joined_at) VALUES (?, ?, ?)",
    ).run(id, user.id, createdAt);
  })();
  return NextResponse.json(
    { group: { id, name: groupName, invite_code: code } },
    { status: 201 },
  );
}
