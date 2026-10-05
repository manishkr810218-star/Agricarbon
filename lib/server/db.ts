import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const dataDir = resolve(process.env.AGRICARBON_DATA_DIR || ".agricarbon-data");

type GlobalDatabase = typeof globalThis & {
  __agricarbonDb?: Database.Database;
};

export function getDataDir() {
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  return dataDir;
}

export function getDb() {
  const cache = globalThis as GlobalDatabase;
  if (cache.__agricarbonDb) return cache.__agricarbonDb;

  const db = new Database(resolve(getDataDir(), "agricarbon.sqlite"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS farms (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS crop_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      year INTEGER NOT NULL,
      season TEXT NOT NULL,
      crop TEXT NOT NULL,
      tillage TEXT NOT NULL,
      irrigation TEXT NOT NULL,
      input_notes TEXT NOT NULL DEFAULT '',
      water_notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS crop_records_user_year ON crop_records(user_id, year DESC);
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS documents_user ON documents(user_id, created_at DESC);
    CREATE TABLE IF NOT EXISTS land_plots (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      area_acres REAL NOT NULL,
      tenure TEXT NOT NULL,
      village TEXT NOT NULL,
      parcel_reference TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS land_plots_user ON land_plots(user_id);
    CREATE TABLE IF NOT EXISTS mrv_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_date TEXT NOT NULL,
      practice TEXT NOT NULL,
      details TEXT NOT NULL,
      evidence_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS mrv_events_user ON mrv_events(user_id, event_date DESC);
    CREATE TABLE IF NOT EXISTS finance_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      entry_date TEXT NOT NULL,
      kind TEXT NOT NULL,
      category TEXT NOT NULL,
      amount_paise INTEGER NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      evidence_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS finance_entries_user ON finance_entries(user_id, entry_date DESC);
    CREATE TABLE IF NOT EXISTS credit_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      entry_date TEXT NOT NULL,
      action TEXT NOT NULL,
      quantity_milli INTEGER NOT NULL,
      registry TEXT NOT NULL,
      reference TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS credit_entries_user ON credit_entries(user_id, entry_date DESC);
    CREATE TABLE IF NOT EXISTS farmer_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      invite_code TEXT NOT NULL UNIQUE,
      owner_user_id TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS group_members (
      group_id TEXT NOT NULL REFERENCES farmer_groups(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TEXT NOT NULL,
      PRIMARY KEY (group_id, user_id)
    );
  `);
  const documentColumns = db.pragma("table_info(documents)") as {
    name: string;
  }[];
  if (!documentColumns.some((column) => column.name === "plot_id")) {
    db.exec(
      "ALTER TABLE documents ADD COLUMN plot_id TEXT REFERENCES land_plots(id) ON DELETE SET NULL",
    );
  }
  cache.__agricarbonDb = db;
  return db;
}
