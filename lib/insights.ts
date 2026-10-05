import { assessFarm, type Farm } from "./readiness";
import type {
  CreditEntry,
  FarmDocument,
  FinanceEntry,
  LandPlot,
  MrvEvent,
} from "./portal-types";

export const practiceEvidenceKinds = ["photo", "input", "soil"] as const;
export function hasPracticeEvidence(
  event: MrvEvent,
  documents: FarmDocument[],
) {
  return documents.some(
    (doc) =>
      doc.id === event.evidence_document_id &&
      practiceEvidenceKinds.some((kind) => kind === doc.kind),
  );
}

export function landSizeGuide(acres: number) {
  const hectares = acres * 0.404686;
  const band =
    hectares < 1
      ? "Marginal holding"
      : hectares < 2
        ? "Small holding"
        : hectares < 4
          ? "Semi-medium holding"
          : hectares < 10
            ? "Medium holding"
            : "Large holding";
  const advice =
    hectares < 2
      ? "Ask an FPO or farmer group about pooling field visits and monitoring costs."
      : hectares < 10
        ? "Keep each plot and crop season separate so evidence stays easy to review."
        : "Plan soil samples and monitoring by plot; larger area still needs a program-approved method.";
  return { hectares: Math.round(hectares * 100) / 100, band, advice };
}

export function accountingSummary(entries: FinanceEntry[]) {
  const incomePaise = entries
    .filter((item) => item.kind === "income")
    .reduce((sum, item) => sum + item.amount_paise, 0);
  const expensePaise = entries
    .filter((item) => item.kind === "expense")
    .reduce((sum, item) => sum + item.amount_paise, 0);
  return { incomePaise, expensePaise, netPaise: incomePaise - expensePaise };
}

export function selfReportedCredits(entries: CreditEntry[]) {
  return (
    entries.reduce(
      (sum, entry) =>
        sum + (entry.action === "issued" ? 1 : -1) * entry.quantity_milli,
      0,
    ) / 1000
  );
}

export function mrvSummary(
  farm: Farm,
  events: MrvEvent[],
  documents: FarmDocument[],
) {
  const linked = events.filter((item) =>
    hasPracticeEvidence(item, documents),
  ).length;
  const steps = [
    {
      title: "Baseline",
      done: farm.cropHistoryYears >= 3,
      detail:
        farm.cropHistoryYears >= 3
          ? "Three distinct crop years recorded"
          : `${farm.cropHistoryYears} of 3 crop years recorded`,
    },
    {
      title: "Monitoring",
      done: events.length > 0,
      detail: events.length
        ? `${events.length} dated farm activity logs`
        : "Add dated farm activity logs",
    },
    {
      title: "Evidence",
      done: linked > 0,
      detail: linked
        ? `${linked} monitoring logs linked to files`
        : "Attach a photo, bill or soil record to a log",
    },
    {
      title: "Verification",
      done: false,
      detail: "Independent program review is still required",
    },
  ];
  return { steps, linkedEvidence: linked };
}

export function preliminaryReview(
  farm: Farm,
  plots: LandPlot[],
  events: MrvEvent[],
  documents: FarmDocument[],
) {
  const missing: string[] = [];
  if (!plots.length) missing.push("a separate land-plot record");
  if (
    plots.length &&
    Math.abs(
      plots.reduce((sum, plot) => sum + plot.area_acres, 0) - Number(farm.area),
    ) > 0.01
  )
    missing.push("matching farm and plot area");
  if (farm.cropHistoryYears < 3) missing.push("three crop years");
  if (!documents.some((doc) => ["land", "deed", "lease"].includes(doc.kind)))
    missing.push("land-rights document");
  if (!documents.some((doc) => doc.kind === "soil"))
    missing.push("soil report");
  if (!events.some((event) => hasPracticeEvidence(event, documents)))
    missing.push("dated MRV log linked to a photo, input bill or soil report");
  const score = assessFarm(farm).score;
  const readyToAsk = score >= 80 && missing.length === 0;
  return {
    readyToAsk,
    label: readyToAsk
      ? "Ready to request an external pre-screening"
      : "Keep preparing before program review",
    reason: readyToAsk
      ? "Core records are in place for a first conversation; a program must still decide eligibility."
      : "Collect " +
        (missing.length
          ? missing.join(", ")
          : "the remaining readiness evidence") +
        " and review your practice score.",
    missing,
  };
}

export function farmSuggestions(
  farm: Farm,
  plots: LandPlot[],
  events: MrvEvent[],
  documents: FarmDocument[],
  finance: FinanceEntry[],
) {
  const assessment = assessFarm(farm);
  const tips: { title: string; reason: string; action: string }[] = [];
  if (farm.cropHistoryYears < 3)
    tips.push({
      title: "Complete your farm baseline",
      reason:
        "Programs may need several earlier crop years to compare practice changes.",
      action: "Add each missing year in Crop history.",
    });
  if (!plots.length)
    tips.push({
      title: "List your land plots",
      reason:
        "Separate plot details help you match records to the right property.",
      action: "Add a plot in Land & papers.",
    });
  if (!documents.some((doc) => ["land", "deed", "lease"].includes(doc.kind)))
    tips.push({
      title: "Keep land proof ready",
      reason: "Ownership or lease rights may be checked by a program.",
      action: "Upload a deed, land record or lease in Document locker.",
    });
  if (!events.length)
    tips.push({
      title: "Start a dated practice diary",
      reason:
        "A current practice needs a dated record before it can be reviewed.",
      action: "Add your next farm activity in MRV diary.",
    });
  if (
    events.length &&
    !events.some((event) => hasPracticeEvidence(event, documents))
  )
    tips.push({
      title: "Connect a photo or bill",
      reason:
        "An activity log is easier to review when supporting evidence is linked.",
      action: "Upload a file, then attach it to a new MRV log.",
    });
  if (!finance.length)
    tips.push({
      title: "Track farm costs",
      reason: "A cost record helps you judge whether a program is worthwhile.",
      action: "Add an input or monitoring expense in Farm accounts.",
    });
  if (
    Number(farm.area) > 0 &&
    landSizeGuide(Number(farm.area)).hectares < 2 &&
    !farm.fpo
  )
    tips.push({
      title: "Explore a farmer group",
      reason: "Smaller holdings may benefit from shared monitoring costs.",
      action: "Ask about an FPO or create a farmer group.",
    });
  const gapActions: Record<string, string> = {
    Records: "Add the missing years in Crop history.",
    Land: "Review Land & papers and upload any proof you have.",
    Inputs: "Update your input answers and save bills in Document locker.",
    Soil: "Upload a soil report in Document locker.",
    Evidence: "Save a dated field photo or bill in Document locker.",
    Water: "Add a dated irrigation note in MRV diary.",
    Practices: "Review your practice answers in Farm assessment.",
    Group: "Ask about an FPO or open Farmer groups.",
  };
  for (const gap of assessment.gaps) {
    if (tips.length >= 5) break;
    if (!tips.some((tip) => tip.title === gap.title))
      tips.push({
        title: gap.title,
        reason: gap.detail,
        action:
          gapActions[gap.category] || "Review this gap in your farm workspace.",
      });
  }
  return tips.slice(0, 5);
}
