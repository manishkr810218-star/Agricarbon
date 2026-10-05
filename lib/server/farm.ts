import "server-only";
import { assessFarm, emptyFarm, type Farm } from "@/lib/readiness";
import { getDb } from "./db";

export function cropHistoryYears(userId: string) {
  const row = getDb()
    .prepare(
      "SELECT COUNT(DISTINCT year) AS years FROM crop_records WHERE user_id = ?",
    )
    .get(userId) as { years: number };
  return Math.min(3, row.years);
}

export function getFarm(userId: string): Farm {
  const row = getDb()
    .prepare("SELECT data FROM farms WHERE user_id = ?")
    .get(userId) as { data: string } | undefined;
  const data = row ? (JSON.parse(row.data) as Partial<Farm>) : {};
  return { ...emptyFarm, ...data, cropHistoryYears: cropHistoryYears(userId) };
}

export function saveFarm(userId: string, farm: Farm) {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `
    INSERT INTO farms (user_id, data, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `,
    )
    .run(userId, JSON.stringify({ ...farm, cropHistoryYears: 0 }), now);
  return { farm: getFarm(userId), assessment: assessFarm(getFarm(userId)) };
}

export function farmSummary(userId: string) {
  const farm = getFarm(userId);
  return { farm, assessment: assessFarm(farm) };
}
