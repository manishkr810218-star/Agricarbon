import { assessFarm, type Farm } from "./readiness";
import type { ProgramPath } from "./programs";

export type Assessment = ReturnType<typeof assessFarm>;
export type PortalPage =
  | "overview"
  | "analysis"
  | "assessment"
  | "crops"
  | "documents"
  | "programs"
  | "groups"
  | "land"
  | "mrv"
  | "accounts"
  | "guide";
export type FarmResponse = { farm: Farm; assessment: Assessment };
export type Crop = {
  id: string;
  year: number;
  season: string;
  crop: string;
  tillage: string;
  irrigation: string;
  input_notes: string;
  water_notes: string;
  created_at: string;
};
export type FarmDocument = {
  id: string;
  kind: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  plot_id: string | null;
};
export type LandPlot = {
  id: string;
  name: string;
  area_acres: number;
  tenure: "owned" | "leased" | "other";
  village: string;
  parcel_reference: string;
  notes: string;
  created_at: string;
};
export type MrvEvent = {
  id: string;
  event_date: string;
  practice: string;
  details: string;
  evidence_document_id: string | null;
  created_at: string;
};
export type FinanceEntry = {
  id: string;
  entry_date: string;
  kind: "expense" | "income";
  category: string;
  amount_paise: number;
  note: string;
  evidence_document_id: string | null;
  created_at: string;
};
export type CreditEntry = {
  id: string;
  entry_date: string;
  action: "issued" | "retired";
  quantity_milli: number;
  registry: string;
  reference: string;
  note: string;
  created_at: string;
};
export type FarmerGroup = {
  id: string;
  name: string;
  invite_code: string | null;
  owner_user_id: string;
  created_at: string;
  member_count: number;
};
export type GroupSummary = {
  group: { id: string; name: string };
  members: {
    name: string;
    village: string;
    area: number;
    score: number;
    level: string;
    topGap: string | null;
  }[];
  summary: {
    count: number;
    totalArea: number;
    averageScore: number;
    commonGaps: { title: string; count: number }[];
  };
};
export type PortalData = FarmResponse & {
  crops: Crop[];
  documents: FarmDocument[];
  groups: FarmerGroup[];
  paths: ProgramPath[];
  plots: LandPlot[];
  mrvEvents: MrvEvent[];
  financeEntries: FinanceEntry[];
  creditEntries: CreditEntry[];
};
