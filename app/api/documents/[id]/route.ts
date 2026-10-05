import { readFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { userFromRequest } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { uploadDir, type DocumentRecord } from "@/lib/server/documents";
import { errorResponse } from "@/lib/server/http";

export const runtime = "nodejs";

function ownDocument(userId: string, id: string) {
  return getDb()
    .prepare(
      `SELECT id, kind, original_name, stored_name, mime_type, size_bytes, created_at, plot_id
    FROM documents WHERE id = ? AND user_id = ?`,
    )
    .get(id, userId) as DocumentRecord | undefined;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  const document = ownDocument(user.id, (await context.params).id);
  if (!document) return errorResponse("Document not found.", 404);
  try {
    const bytes = await readFile(resolve(uploadDir(), document.stored_name));
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": document.mime_type,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(document.original_name)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return errorResponse("Document file is unavailable.", 404);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  const document = ownDocument(user.id, (await context.params).id);
  if (!document) return errorResponse("Document not found.", 404);
  getDb()
    .prepare("DELETE FROM documents WHERE id = ? AND user_id = ?")
    .run(document.id, user.id);
  await unlink(resolve(uploadDir(), document.stored_name)).catch(
    () => undefined,
  );
  return NextResponse.json({ ok: true });
}
