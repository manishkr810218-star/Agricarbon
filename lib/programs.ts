import { assessFarm, type Farm } from "./readiness";

export type ProgramPath = {
  key: string;
  title: string;
  status: "Explore" | "Build evidence";
  why: string;
  next: string;
};

export function matchProgramPaths(farm: Farm): ProgramPath[] {
  const assessment = assessFarm(farm);
  const practiceScore =
    assessment.categories.find((item) => item.key === "practices")?.score || 0;
  return [
    {
      key: "practice",
      title: "Practice-based opportunities",
      status: practiceScore >= 50 ? "Explore" : "Build evidence",
      why:
        practiceScore >= 50
          ? "You report several soil-friendly practices. A program would still need dated proof and its own eligibility check."
          : "Start or document practices such as cover crops, rotation, mulching or reduced tillage.",
      next: "Keep dated photos and seasonal practice notes.",
    },
    {
      key: "soil",
      title: "Soil-carbon projects",
      status:
        farm.cropHistoryYears >= 3 && farm.soilTest
          ? "Explore"
          : "Build evidence",
      why:
        farm.cropHistoryYears >= 3 && farm.soilTest
          ? "Three years of crop records and an initial soil test are present. Formal baseline, sampling and verification are still required."
          : "These projects commonly need historical farm records and formal soil measurements.",
      next:
        farm.cropHistoryYears < 3
          ? "Complete three years of crop history."
          : "Ask a qualified program about its soil-sampling method.",
    },
    {
      key: "trees",
      title: "Agroforestry pathways",
      status: farm.agroforestry ? "Explore" : "Build evidence",
      why: farm.agroforestry
        ? "You report trees on or around your farm. Species, planting dates, boundaries and monitoring would need review."
        : "This pathway may fit farms adding and maintaining trees where locally appropriate.",
      next: "Record tree species, planting dates and field photos.",
    },
    {
      key: "group",
      title: "FPO or group projects",
      status: farm.fpo ? "Explore" : "Build evidence",
      why: farm.fpo
        ? "A farmer group can organize shared records and explore aggregated projects."
        : "Small farms may benefit from joining an FPO or farmer group.",
      next: "Ask a local group about its documented project requirements.",
    },
  ];
}
