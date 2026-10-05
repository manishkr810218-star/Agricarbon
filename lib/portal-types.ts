import { assessFarm, type Farm } from "./readiness";
import type { ProgramPath } from "./programs";

export type Assessment = ReturnType<typeof assessFarm>;
export type PortalPage =
  "overview" | "assessment" | "crops" | "documents" | "programs" | "groups";
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
};
