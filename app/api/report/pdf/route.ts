import "regenerator-runtime/runtime";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import { NextRequest, NextResponse } from "next/server";
import { analyzeCarbonReadiness } from "@/lib/carbon-analysis";
import {
  accountingSummary,
  farmSuggestions,
  hasPracticeEvidence,
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
  const db = getDb();
  const plots = db
    .prepare(
      "SELECT * FROM land_plots WHERE user_id = ? ORDER BY created_at DESC",
    )
    .all(user.id) as LandPlot[];
  const events = db
    .prepare(
      "SELECT * FROM mrv_events WHERE user_id = ? ORDER BY event_date DESC",
    )
    .all(user.id) as MrvEvent[];
  const finance = db
    .prepare(
      "SELECT * FROM finance_entries WHERE user_id = ? ORDER BY entry_date DESC",
    )
    .all(user.id) as FinanceEntry[];
  const credits = db
    .prepare(
      "SELECT * FROM credit_entries WHERE user_id = ? ORDER BY entry_date DESC",
    )
    .all(user.id) as CreditEntry[];
  const documents = db
    .prepare(
      "SELECT id,kind,original_name,mime_type,size_bytes,created_at,plot_id FROM documents WHERE user_id = ? ORDER BY created_at DESC",
    )
    .all(user.id) as FarmDocument[];
  const cropRows = db
    .prepare(
      "SELECT year,season,crop,tillage,irrigation FROM crop_records WHERE user_id = ? ORDER BY year DESC",
    )
    .all(user.id) as {
    year: number;
    season: string;
    crop: string;
    tillage: string;
    irrigation: string;
  }[];
  const financeTotals = accountingSummary(finance);
  const mrv = mrvSummary(farm, events, documents);
  const sizeGuide = landSizeGuide(Number(farm.area) || 0);
  const tips = farmSuggestions(farm, plots, events, documents, finance);
  const review = preliminaryReview(farm, plots, events, documents);
  const creditAnalysis = analyzeCarbonReadiness(
    farm,
    cropRows,
    plots,
    events,
    documents,
  );
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const devanagariNormal = await pdf.embedFont(
    await readFile(
      resolve(process.cwd(), "assets/fonts/NotoSansDevanagari-Regular.ttf"),
    ),
    { subset: true },
  );
  const devanagariBold = await pdf.embedFont(
    await readFile(
      resolve(process.cwd(), "assets/fonts/NotoSansDevanagari-Bold.ttf"),
    ),
    { subset: true },
  );
  const latinNormal = await pdf.embedFont(
    await readFile(resolve(process.cwd(), "assets/fonts/NotoSans-Regular.ttf")),
    { subset: true },
  );
  const latinBold = await pdf.embedFont(
    await readFile(resolve(process.cwd(), "assets/fonts/NotoSans-Bold.ttf")),
    { subset: true },
  );
  const green = rgb(0.12, 0.36, 0.26);
  const gray = rgb(0.3, 0.39, 0.32);
  const black = rgb(0.1, 0.18, 0.13);
  let page: PDFPage = pdf.addPage([595, 842]);
  let y = 792;
  const left = 48;
  const maxWidth = 500;

  function nextPage(needed = 30) {
    if (y - needed >= 60) return;
    page = pdf.addPage([595, 842]);
    y = 792;
  }
  function clean(value: unknown) {
    return String(value ?? "")
      .replace(/[\u0000-\u001f\u007f]/g, " ")
      .trim();
  }
  function runs(value: string, strong: boolean) {
    return (value.match(/[\u0900-\u097f]+|[^\u0900-\u097f]+/gu) || []).map(
      (text) => ({
        text,
        font: /[\u0900-\u097f]/u.test(text)
          ? strong
            ? devanagariBold
            : devanagariNormal
          : strong
            ? latinBold
            : latinNormal,
      }),
    );
  }
  function measure(value: string, size: number, strong: boolean) {
    return runs(value, strong).reduce(
      (width, run) => width + run.font.widthOfTextAtSize(run.text, size),
      0,
    );
  }
  function write(value: unknown, size = 10, strong = false, color = black) {
    const words = clean(value).split(/\s+/);
    let line = "";
    const lines: string[] = [];
    for (const word of words) {
      if (measure(word, size, strong) > maxWidth) {
        if (line) lines.push(line);
        line = "";
        for (const character of Array.from(word)) {
          if (line && measure(line + character, size, strong) > maxWidth) {
            lines.push(line);
            line = character;
          } else line += character;
        }
        continue;
      }
      const proposal = line ? line + " " + word : word;
      if (line && measure(proposal, size, strong) > maxWidth) {
        lines.push(line);
        line = word;
      } else line = proposal;
    }
    if (line) lines.push(line);
    if (!lines.length) return;
    for (const text of lines) {
      nextPage(size + 8);
      let x = left;
      for (const run of runs(text, strong)) {
        page.drawText(run.text, { x, y, font: run.font, size, color });
        x += run.font.widthOfTextAtSize(run.text, size);
      }
      y -= size + 7;
    }
  }
  function heading(title: string) {
    nextPage(47);
    y -= 13;
    write(title, 13, true, green);
    y -= 3;
  }
  function item(label: string, value: unknown) {
    write(label + ": " + clean(value));
  }
  function space() {
    y -= 7;
  }

  write("AGRICARBON  |  FARM READINESS REPORT", 15, true, green);
  write(
    "Generated " +
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) +
      " IST",
    9,
    false,
    gray,
  );
  space();
  write("Farmer: " + (farm.name || user.name), 12, true);
  item(
    "Location",
    [farm.village, farm.district, farm.state].filter(Boolean).join(", "),
  );
  item(
    "Farm area",
    (farm.area || "Not entered") +
      " acres / about " +
      sizeGuide.hectares +
      " hectares",
  );
  item("Indicative holding size", sizeGuide.band);
  space();
  heading("1. Preparation, not eligibility");
  write(
    "Readiness score: " + assessment.score + "/100 - " + assessment.level,
    12,
    true,
  );
  write("Preliminary next step: " + review.label, 10, true);
  write(review.reason);
  write(
    "This is a preliminary assessment of self-entered practices and records. It cannot determine carbon-credit eligibility, quantity, price or issuance.",
  );
  for (const category of assessment.categories)
    item(
      category.label,
      Math.round(category.score) +
        "% within category; weight " +
      category.weight +
        "%",
    );
  heading("2. Carbon credit analysis");
  item(
    "Practice preparation",
    Math.round(creditAnalysis.practiceScore) +
      "/100 (self-reported; not carbon quantity)",
  );
  item(
    "Evidence checklist",
    creditAnalysis.evidenceReady +
      " of " +
      creditAnalysis.evidenceTotal +
      " preparation items on file",
  );
  item("Historical comparison", creditAnalysis.historySignal.title);
  write(creditAnalysis.historySignal.detail);
  for (const check of creditAnalysis.checks)
    write(
      "- " +
        (check.done ? "On file" : "Still needed") +
        ": " +
        check.title +
        ". " +
        check.detail,
    );
  write(
    "This analysis identifies preparation gaps only. It does not quantify emissions, soil carbon or sellable credits.",
    9,
    false,
    gray,
  );
  heading("3. Land and property records");
  write(sizeGuide.advice);
  item("Saved plots", plots.length);
  for (const plot of plots)
    write(
      "- " +
        plot.name +
        ": " +
        plot.area_acres +
        " acres, " +
        plot.tenure +
        ", " +
        plot.village +
        (plot.parcel_reference ? ", parcel " + plot.parcel_reference : ""),
    );
  write(
    "Minimum and maximum land area depend on the chosen program. Saved papers have not been checked against government records.",
    9,
    false,
    gray,
  );
  heading("4. Baseline and MRV status");
  item("Distinct crop years", farm.cropHistoryYears + " of 3 target years");
  for (const row of cropRows)
    write(
      "- " +
        row.year +
        " " +
        row.season +
        ": " +
        row.crop +
        ", " +
        row.tillage +
        " tillage, " +
        row.irrigation +
        " irrigation",
    );
  for (const step of mrv.steps) item(step.title, step.detail);
  for (const event of events)
    write(
      "- " +
        event.event_date +
        " " +
        event.practice.replaceAll("_", " ") +
        ": " +
        event.details +
        (hasPracticeEvidence(event, documents)
          ? " [practice evidence linked]"
          : " [no practice evidence]"),
    );
  heading("5. Evidence on file");
  item("Files stored privately", documents.length);
  for (const doc of documents)
    write(
      "- " +
        doc.kind +
        ": " +
        doc.original_name +
        (doc.plot_id
          ? " / plot " +
            (plots.find((plot) => plot.id === doc.plot_id)?.name || "unknown")
          : "") +
        " (unverified)",
    );
  heading("6. Farm accounts");
  item(
    "Recorded income",
    "INR " + (financeTotals.incomePaise / 100).toFixed(2),
  );
  item(
    "Recorded expenses",
    "INR " + (financeTotals.expensePaise / 100).toFixed(2),
  );
  item(
    "Recorded net cash flow",
    "INR " + (financeTotals.netPaise / 100).toFixed(2),
  );
  for (const entry of finance)
    write(
      "- " +
        entry.entry_date +
        " " +
        entry.kind +
        ": " +
        entry.category +
        " INR " +
        (entry.amount_paise / 100).toFixed(2),
    );
  heading("7. Current carbon credits");
  write(
    "Verified balance: unavailable. No carbon registry is connected.",
    10,
    true,
  );
  item(
    "Self-reported transaction balance",
    selfReportedCredits(credits).toFixed(3) + " credits (unverified)",
  );
  for (const entry of credits)
    write(
      "- " +
        entry.entry_date +
        " " +
        entry.action +
        " " +
        (entry.quantity_milli / 1000).toFixed(3) +
        " credits, " +
        entry.registry +
        ", ref " +
        entry.reference +
        " [self-reported]",
    );
  heading("8. Suggested next actions");
  if (!tips.length) write("Keep records current each season.");
  for (const tip of tips) write("- " + tip.title + ": " + tip.action);
  heading("Important limitation");
  write(
    "AgriCarbon does not verify land ownership, documents, soil carbon, baseline, additionality or issued credits. A carbon program and independent verifier must perform the required checks. Do not use this report as a certificate or sales document.",
    9,
    false,
    gray,
  );
  for (const [index, sheet] of pdf.getPages().entries()) {
    sheet.drawText("AgriCarbon | Private farmer report | Page " + (index + 1), {
      x: left,
      y: 30,
      font: latinNormal,
      size: 8,
      color: gray,
    });
  }
  const bytes = await pdf.save();
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        "attachment; filename=agricarbon-farm-readiness.pdf",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
