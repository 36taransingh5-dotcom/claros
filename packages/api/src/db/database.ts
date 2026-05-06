import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedDatabase } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../../claros.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initDatabase(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS parts (
      id TEXT PRIMARY KEY,
      part_number TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      manufacturer TEXT NOT NULL,
      application_domain TEXT NOT NULL,
      specifications TEXT NOT NULL,
      oem_numbers TEXT NOT NULL DEFAULT '[]',
      search_text TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year_from INTEGER NOT NULL,
      year_to INTEGER NOT NULL,
      engine_type TEXT NOT NULL,
      engine_code TEXT,
      category TEXT NOT NULL DEFAULT 'truck'
    );

    CREATE TABLE IF NOT EXISTS compatibility (
      id TEXT PRIMARY KEY,
      part_id TEXT NOT NULL REFERENCES parts(id),
      vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS queries (
      id TEXT PRIMARY KEY,
      image_path TEXT,
      input_type TEXT NOT NULL DEFAULT 'image',
      text_input TEXT,
      vision_result TEXT,
      matches TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      query_id TEXT NOT NULL REFERENCES queries(id),
      part_id TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS parts_fts USING fts5(
      id UNINDEXED,
      part_number,
      name,
      category,
      description,
      manufacturer,
      search_text,
      content='parts',
      content_rowid='rowid'
    );
  `);

  // Check if seeding needed
  const count = db.prepare('SELECT COUNT(*) as c FROM parts').get() as { c: number };
  if (count.c === 0) {
    console.log('🌱 Seeding database...');
    seedDatabase(db);
    console.log('✅ Database seeded');
  }
}
