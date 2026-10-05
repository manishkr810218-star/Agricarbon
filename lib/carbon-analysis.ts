import { hasPracticeEvidence, preliminaryReview } from "./insights";
import { assessFarm, type Farm } from "./readiness";
import type {
  FarmDocument,
  LandPlot,
  MrvEvent,
  PortalPage,
} from "./portal-types";

type PastCrop = { year: number; tillage: string };

export type EvidenceCheck = {
  key: string;
  title: string;
  detail: string;
  done: boolean;
  page: PortalPage;
  action: string;
};

const scenarios: {
  key: string;
  title: string;
  change: Partial<Farm>;
  applicable: (farm: Farm) => boolean;
}[] = [
  {
    key: "cover-crops",
    title: "Use and record cover crops",
    change: { coverCrops: true },
    applicable: (farm) => !farm.coverCrops,
  },
  {
    key: "rotation",
    title: "Record crop rotation",
    change: { cropRotation: true },
    applicable: (farm) => !farm.cropRotation,
  },
  {
    key: "mulching",
    title: "Use and record mulching",
    change: { mulching: true },
    applicable: (farm) => !farm.mulching,
  },
  {
    key: "fertilizer-records",
    title: "Start fertilizer-use records",
    change: { fertilizerRecords: true },
    applicable: (farm) => !farm.fertilizerRecords,
  },
  {
    key: "irrigation-records",
    title: "Record irrigation dates",
    change: { waterRecords: true },
    applicable: (farm) => !farm.waterRecords,
  },
  {
    key: "soil-test",
    title: "Get a soil test",
    change: { soilTest: true },
    applicable: (farm) => !farm.soilTest,
  },
  {
    key: "field-photos",
    title: "Keep dated field photos",
    change: { fieldPhotos: true },
    applicable: (farm) => !farm.fieldPhotos,
  },
  {
    key: "input-bills",
    title: "Keep purchase bills",
    change: { inputBills: true },
    applicable: (farm) => !farm.inputBills,
  },
  {
    key: "land-proof",
    title: "Record land-rights proof",
    change: { landProof: true },
    applicable: (farm) => !farm.landProof,
  },
];

export function analyzeCarbonReadiness(
  farm: Farm,
  crops: PastCrop[],
  plots: LandPlot[],
  events: MrvEvent[],
  documents: FarmDocument[],
) {
  const assessment = assessFarm(farm);
  const practiceScore =
    assessment.categories.find((category) => category.key === "practices")
      ?.score ?? 0;
  const plotArea = plots.reduce((sum, plot) => sum + plot.area_acres, 0);
  const linkedEvents = events.filter((event) =>
    hasPracticeEvidence(event, documents),
  ).length;
  const checks: EvidenceCheck[] = [
    {
      key: "land",
      title: "Map your land",
      detail:
        plots.length && Number(farm.area) > 0
          ? `${plotArea.toFixed(2)} plot acres / ${Number(farm.area).toFixed(2)} farm acres`
          : "Add plots whose total area matches your farm area.",
      done:
        plots.length > 0 &&
        Number(farm.area) > 0 &&
        Math.abs(plotArea - Number(farm.area)) <= 0.01,
      page: "land",
      action: "Open land plots",
    },
    {
      key: "history",
      title: "Build a crop baseline",
      detail: `${Math.min(farm.cropHistoryYears, 3)} of 3 distinct years recorded`,
      done: farm.cropHistoryYears >= 3,
      page: "crops",
      action: "Add crop years",
    },
    {
      key: "rights",
      title: "Keep land-rights proof",
      detail: "Save a land record, deed, or lease agreement.",
      done: documents.some((doc) =>
        ["land", "deed", "lease"].includes(doc.kind),
      ),
      page: "documents",
      action: "Upload land proof",
    },
    {
      key: "soil",
      title: "Keep a soil report",
      detail: "A Soil Health Card or lab report is preliminary evidence.",
      done: documents.some((doc) => doc.kind === "soil"),
      page: "documents",
      action: "Upload soil report",
    },
    {
      key: "monitoring",
      title: "Log dated field activity",
      detail: `${events.length} dated activity ${events.length === 1 ? "entry" : "entries"}`,
      done: events.length > 0,
      page: "mrv",
      action: "Open MRV diary",
    },
    {
      key: "evidence",
      title: "Link activity to evidence",
      detail: `${linkedEvents} ${linkedEvents === 1 ? "entry" : "entries"} linked to a photo, bill, or soil report`,
      done: linkedEvents > 0,
      page: "mrv",
      action: "Link evidence",
    },
  ];
  const review = preliminaryReview(farm, plots, events, documents);
  const reportedPractices = [
    farm.tillage !== "conventional" && "Reduced or zero tillage",
    farm.coverCrops && "Cover crops",
    farm.cropRotation && "Crop rotation",
    farm.mulching && "Mulching",
    farm.agroforestry && "Agroforestry",
    farm.residueBurning === false && "No residue burning",
    farm.manure && "Manure or compost",
  ].filter((item): item is string => Boolean(item));
  const earlierCrops = crops.filter(
    (crop) => crop.year < new Date().getFullYear(),
  );
  const pastConventional = earlierCrops.some(
    (crop) => crop.tillage === "conventional",
  );
  const historySignal =
    !earlierCrops.length
      ? {
          title: "Historical comparison pending",
          detail:
            "Add an earlier crop season before comparing old and current tillage.",
        }
      : pastConventional && farm.tillage !== "conventional"
        ? {
            title: "Possible tillage change to document",
            detail:
              "An older season lists conventional tillage and your current answer is reduced or zero tillage. A program must check dates, plots, and whether this change qualifies.",
          }
        : {
            title: "No tillage change established here",
            detail:
              "The saved history does not show a conventional-to-reduced tillage change. Other practice changes may still exist and need dated proof.",
          };
  const possibleActions = scenarios
    .filter((scenario) => scenario.applicable(farm))
    .map((scenario) => {
      const projectedScore = assessFarm({ ...farm, ...scenario.change }).score;
      return {
        key: scenario.key,
        title: scenario.title,
        projectedScore,
        increase: projectedScore - assessment.score,
      };
    })
    .filter((scenario) => scenario.increase > 0)
    .sort((a, b) => b.increase - a.increase);

  return {
    readinessScore: assessment.score,
    level: assessment.level,
    practiceScore,
    evidenceReady: checks.filter((check) => check.done).length,
    evidenceTotal: checks.length,
    checks,
    reportedPractices,
    historySignal,
    possibleActions,
    review,
    linkedEvents,
    verifiedCredits: null,
  };
}
