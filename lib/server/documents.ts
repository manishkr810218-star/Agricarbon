import "server-only";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { getDataDir } from "./db";

export const documentKinds = [
  "land",
  "soil",
  "input",
  "photo",
  "other",
] as const;
export type DocumentKind = (typeof documentKinds)[number];

export type DocumentRecord = {
  id: string;
  kind: DocumentKind;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

export function uploadDir() {
  const dir = resolve(getDataDir(), "uploads");
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  return dir;
}
