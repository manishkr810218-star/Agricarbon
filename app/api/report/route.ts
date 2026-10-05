import { NextRequest, NextResponse } from "next/server";
import { analyzeCarbonReadiness } from "@/lib/carbon-analysis";
import { matchProgramPaths } from "@/lib/programs";
import {
  accountingSummary,
  farmSuggestions,
  landSizeGuide,
  mrvSummary,
  preliminaryReview,
  selfReportedCredits,
} from "@/lib/insights";
import type {
  CreditEntry,
  FarmDocument,
  FinanceEntry,
  LandPlot,
  MrvEvent,
} from "@/lib/portal-types";
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
    .all(user.id) as { year: number; tillage: string }[];
  const documents = getDb()
    .prepare(
      `SELECT kind, original_name, created_at
    FROM documents WHERE user_id = ? ORDER BY created_at DESC`,
    )
    .all(user.id) as {
    kind: string;
    original_name: string;
    created_at: string;
  }[];
  const plots = getDb()
    .prepare(
      "SELECT * FROM land_plots WHERE user_id = ? ORDER BY created_at DESC",
    )
    .all(user.id) as LandPlot[];
  const events = getDb()
    .prepare(
      "SELECT * FROM mrv_events WHERE user_id = ? ORDER BY event_date DESC",
    )
    .all(user.id) as MrvEvent[];
  const finance = getDb()
    .prepare(
      "SELECT * FROM finance_entries WHERE user_id = ? ORDER BY entry_date DESC",
    )
    .all(user.id) as FinanceEntry[];
  const credits = getDb()
    .prepare(
      "SELECT * FROM credit_entries WHERE user_id = ? ORDER BY entry_date DESC",
    )
    .all(user.id) as CreditEntry[];
  const evidenceFiles = getDb()
    .prepare(
      "SELECT id,kind,original_name,mime_type,size_bytes,created_at,plot_id FROM documents WHERE user_id = ?",
    )
    .all(user.id) as FarmDocument[];
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
    creditAnalysis: analyzeCarbonReadiness(
      farm,
      cropRecords,
      plots,
      events,
      evidenceFiles,
    ),
    preliminaryReview: preliminaryReview(farm, plots, events, evidenceFiles),
    cropRecords,
    documents,
    possiblePaths: matchProgramPaths(farm),
    land: { plots, sizeGuide: landSizeGuide(Number(farm.area) || 0) },
    mrv: { events, summary: mrvSummary(farm, events, evidenceFiles) },
    accounts: { entries: finance, summary: accountingSummary(finance) },
    carbonCredits: {
      verifiedBalance: null,
      registryConnected: false,
      selfReportedBalance: selfReportedCredits(credits),
      selfReportedEntries: credits,
    },
    suggestions: farmSuggestions(farm, plots, events, evidenceFiles, finance),
    disclaimer:
      "Readiness guidance only. This report does not establish carbon-credit eligibility, amount, ownership or verification. All files and credit entries are self-reported.",
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
