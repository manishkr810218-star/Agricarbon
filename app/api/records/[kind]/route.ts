import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { practiceEvidenceKinds } from "@/lib/insights";
import { userFromRequest } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import { errorResponse, jsonBody } from "@/lib/server/http";
import {
  creditSchema,
  financeSchema,
  mrvSchema,
  plotSchema,
} from "@/lib/server/schema";

export const runtime = "nodejs";
type Context = { params: Promise<{ kind: string }> };
const tables = {
  plots: "land_plots",
  mrv: "mrv_events",
  finance: "finance_entries",
  credits: "credit_entries",
} as const;
type Kind = keyof typeof tables;

function tableFor(kind: string) {
  return Object.hasOwn(tables, kind) ? tables[kind as Kind] : null;
}

function ownEvidence(userId: string, id?: string | null, practiceOnly = false) {
  if (!id) return true;
  const row = getDb()
    .prepare("SELECT kind FROM documents WHERE id = ? AND user_id = ?")
    .get(id, userId) as { kind: string } | undefined;
  return Boolean(
    row &&
    (!practiceOnly || practiceEvidenceKinds.some((kind) => kind === row.kind)),
  );
}

export async function GET(request: NextRequest, context: Context) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  const table = tableFor((await context.params).kind);
  if (!table) return errorResponse("Unknown record type.", 404);
  const order = table === "land_plots" ? "created_at" : "entry_date";
  const dateColumn = table === "mrv_events" ? "event_date" : order;
  const records = getDb()
    .prepare(
      "SELECT * FROM " +
        table +
        " WHERE user_id = ? ORDER BY " +
        dateColumn +
        " DESC, created_at DESC",
    )
    .all(user.id);
  return NextResponse.json(
    { records },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: NextRequest, context: Context) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  const kind = (await context.params).kind;
  if (!tableFor(kind)) return errorResponse("Unknown record type.", 404);
  const body = await jsonBody(request);
  const id = randomUUID();
  const now = new Date().toISOString();
  const db = getDb();

  if (kind === "plots") {
    const parsed = plotSchema.safeParse(body);
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message || "Check land details.",
      );
    const d = parsed.data;
    db.prepare(
      "INSERT INTO land_plots (id,user_id,name,area_acres,tenure,village,parcel_reference,notes,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
    ).run(
      id,
      user.id,
      d.name,
      d.areaAcres,
      d.tenure,
      d.village,
      d.parcelReference,
      d.notes,
      now,
    );
  } else if (kind === "mrv") {
    const parsed = mrvSchema.safeParse(body);
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message || "Check monitoring details.",
      );
    const d = parsed.data;
    if (!ownEvidence(user.id, d.evidenceDocumentId, true))
      return errorResponse(
        "Choose one of your own photos, input bills or soil reports.",
      );
    db.prepare(
      "INSERT INTO mrv_events (id,user_id,event_date,practice,details,evidence_document_id,created_at) VALUES (?,?,?,?,?,?,?)",
    ).run(
      id,
      user.id,
      d.eventDate,
      d.practice,
      d.details,
      d.evidenceDocumentId || null,
      now,
    );
  } else if (kind === "finance") {
    const parsed = financeSchema.safeParse(body);
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message || "Check accounting details.",
      );
    const d = parsed.data;
    if (!ownEvidence(user.id, d.evidenceDocumentId))
      return errorResponse("Choose one of your own evidence files.");
    db.prepare(
      "INSERT INTO finance_entries (id,user_id,entry_date,kind,category,amount_paise,note,evidence_document_id,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
    ).run(
      id,
      user.id,
      d.entryDate,
      d.kind,
      d.category,
      Math.round(d.amountRupees * 100),
      d.note,
      d.evidenceDocumentId || null,
      now,
    );
  } else {
    const parsed = creditSchema.safeParse(body);
    if (!parsed.success)
      return errorResponse(
        parsed.error.issues[0]?.message || "Check credit details.",
      );
    const d = parsed.data;
    if (d.action === "retired") {
      const row = db
        .prepare(
          "SELECT COALESCE(SUM(CASE WHEN action = 'issued' THEN quantity_milli ELSE -quantity_milli END), 0) AS balance FROM credit_entries WHERE user_id = ?",
        )
        .get(user.id) as { balance: number };
      if (Math.round(d.quantity * 1000) > row.balance)
        return errorResponse(
          "Retired credits cannot exceed your self-reported balance.",
        );
    }
    db.prepare(
      "INSERT INTO credit_entries (id,user_id,entry_date,action,quantity_milli,registry,reference,note,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
    ).run(
      id,
      user.id,
      d.entryDate,
      d.action,
      Math.round(d.quantity * 1000),
      d.registry,
      d.reference,
      d.note,
      now,
    );
  }
  return NextResponse.json({ id }, { status: 201 });
}

export async function DELETE(request: NextRequest, context: Context) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  const table = tableFor((await context.params).kind);
  if (!table) return errorResponse("Unknown record type.", 404);
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return errorResponse("Choose a record to remove.");
  const result = getDb()
    .prepare("DELETE FROM " + table + " WHERE id = ? AND user_id = ?")
    .run(id, user.id);
  if (!result.changes) return errorResponse("Record not found.", 404);
  return NextResponse.json({ ok: true });
}
