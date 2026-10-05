export type Farm = {
  name: string;
  village: string;
  district: string;
  state: string;
  area: string;
  tenure: "owned" | "leased" | "other" | "";
  gps: boolean;
  landProof: boolean;
  cropHistoryYears: number;
  tillage: "conventional" | "reduced" | "zero";
  coverCrops: boolean;
  cropRotation: boolean;
  mulching: boolean;
  agroforestry: boolean;
  residueBurning: boolean | null;
  fertilizerRecords: boolean;
  manure: boolean;
  inputBills: boolean;
  irrigation: "flood" | "sprinkler" | "drip" | "rainfed";
  waterRecords: boolean;
  soilTest: boolean;
  soilCarbon: boolean;
  fieldPhotos: boolean;
  fpo: boolean;
};

export const demoFarm: Farm = {
  name: "Asha Devi",
  village: "Ranchi",
  district: "Ranchi",
  state: "Jharkhand",
  area: "2.5",
  tenure: "owned",
  gps: false,
  landProof: true,
  cropHistoryYears: 1,
  tillage: "reduced",
  coverCrops: true,
  cropRotation: true,
  mulching: true,
  agroforestry: false,
  residueBurning: false,
  fertilizerRecords: false,
  manure: true,
  inputBills: false,
  irrigation: "drip",
  waterRecords: false,
  soilTest: true,
  soilCarbon: false,
  fieldPhotos: true,
  fpo: false,
};

export const emptyFarm: Farm = {
  name: "",
  village: "",
  district: "",
  state: "",
  area: "",
  tenure: "",
  gps: false,
  landProof: false,
  cropHistoryYears: 0,
  tillage: "conventional",
  coverCrops: false,
  cropRotation: false,
  mulching: false,
  agroforestry: false,
  residueBurning: null,
  fertilizerRecords: false,
  manure: false,
  inputBills: false,
  irrigation: "flood",
  waterRecords: false,
  soilTest: false,
  soilCarbon: false,
  fieldPhotos: false,
  fpo: false,
};

export type Category = {
  key: string;
  label: string;
  weight: number;
  score: number;
  detail: string;
};
export type Gap = {
  title: string;
  detail: string;
  priority: "High" | "Helpful";
  category: string;
};

export function assessFarm(f: Farm) {
  const categories: Category[] = [
    {
      key: "land",
      label: "Land & identity",
      weight: 15,
      score:
        Number(Number(f.area) > 0) * 25 +
        Number(Boolean(f.village && f.district)) * 25 +
        Number(Boolean(f.tenure)) * 20 +
        Number(f.landProof) * 20 +
        Number(f.gps) * 10,
      detail: "Farm location, area and land records",
    },
    {
      key: "practices",
      label: "Farming practices",
      weight: 30,
      score:
        Number(f.tillage !== "conventional") * 20 +
        Number(f.coverCrops) * 20 +
        Number(f.cropRotation) * 20 +
        Number(f.mulching) * 15 +
        Number(f.agroforestry) * 10 +
        Number(f.residueBurning === false) * 15,
      detail: "Soil-friendly practices and residue care",
    },
    {
      key: "inputs",
      label: "Inputs & emissions",
      weight: 20,
      score:
        Number(f.fertilizerRecords) * 35 +
        Number(f.manure) * 25 +
        Number(f.residueBurning === false) * 20 +
        Number(f.inputBills) * 20,
      detail: "Fertilizer, manure and input records",
    },
    {
      key: "water",
      label: "Water & irrigation",
      weight: 10,
      score:
        Number(f.irrigation !== "flood") * 60 + Number(f.waterRecords) * 40,
      detail: "Irrigation method and water-use records",
    },
    {
      key: "soil",
      label: "Soil health",
      weight: 10,
      score: Number(f.soilTest) * 70 + Number(f.soilCarbon) * 30,
      detail: "Soil Health Card and carbon results",
    },
    {
      key: "documents",
      label: "Documentation",
      weight: 15,
      score:
        (Math.min(3, Math.max(0, f.cropHistoryYears)) / 3) * 40 +
        Number(f.fieldPhotos) * 20 +
        Number(f.landProof) * 20 +
        Number(f.inputBills) * 20,
      detail: "Crop history and supporting evidence",
    },
  ];
  const score = Math.round(
    categories.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0),
  );
  const level =
    score >= 80
      ? "High"
      : score >= 60
        ? "Medium"
        : score >= 40
          ? "Developing"
          : "Getting started";
  const gaps: Gap[] = [];
  const add = (
    title: string,
    detail: string,
    category: string,
    priority: Gap["priority"] = "High",
  ) => gaps.push({ title, detail, category, priority });

  if (f.cropHistoryYears < 3)
    add(
      "Complete three years of crop history",
      "Write down crops and seasons for each missing year. This helps establish a farming baseline.",
      "Records",
    );
  if (!f.landProof)
    add(
      "Add land ownership or lease proof",
      "Keep a copy of a land record or lease agreement for this plot.",
      "Land",
    );
  if (!f.fertilizerRecords)
    add(
      "Start a fertilizer-use diary",
      "Record the product, amount, date and crop each time you apply fertilizer.",
      "Inputs",
    );
  if (!f.soilTest)
    add(
      "Get a soil test",
      "A Soil Health Card or lab report gives useful baseline information. It is preliminary evidence.",
      "Soil",
    );
  if (f.residueBurning)
    add(
      "Avoid burning crop residue",
      "Ask about mulching or composting options suitable for your field.",
      "Practices",
    );
  if (!f.fieldPhotos)
    add(
      "Take dated field photos",
      "Photograph crops and practices each season, and keep the original dates.",
      "Evidence",
    );
  if (!f.inputBills)
    add(
      "Keep input bills",
      "Save fertilizer, seed and other purchase bills by season.",
      "Evidence",
      "Helpful",
    );
  if (!f.waterRecords)
    add(
      "Record irrigation dates",
      "Note when and how each field was watered.",
      "Water",
      "Helpful",
    );
  if (!f.gps)
    add(
      "Mark your plot location",
      "Save a map pin or GPS point for the farm boundary.",
      "Land",
      "Helpful",
    );
  if (!f.coverCrops && !f.mulching)
    add(
      "Explore soil-cover practices",
      "A cover crop or mulch can help protect your soil. Check local crop advice first.",
      "Practices",
      "Helpful",
    );
  if (!f.fpo)
    add(
      "Ask about a local farmer group",
      "An FPO may help small farms explore group programs and shared documentation.",
      "Group",
      "Helpful",
    );
  return { score, level, categories, gaps };
}
