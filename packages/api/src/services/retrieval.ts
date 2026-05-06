import { getDb } from '../db/database.js';
import type { VisionResult } from './vision.js';

export interface PartMatch {
  id: string;
  part_number: string;
  name: string;
  category: string;
  description: string;
  manufacturer: string;
  application_domain: string;
  specifications: Record<string, string>;
  oem_numbers: string[];
  score: number;
}

export interface CompatibilityEntry {
  make: string;
  model: string;
  year_from: number;
  year_to: number;
  engine_type: string;
}

export function searchParts(vision: VisionResult): PartMatch[] {
  const db = getDb();

  const searchTerms = [
    ...vision.suggested_search_terms,
    vision.part_category,
    ...vision.visible_markings,
  ].filter(Boolean);

  const results: PartMatch[] = [];
  const seen = new Set<string>();

  // Extract all unique alphanumeric words longer than 2 chars
  const allWords = searchTerms
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  const uniqueWords = [...new Set(allWords)];

  // Build an OR-based FTS query with prefix matching (e.g. "brake*" OR "shoe*")
  const ftsQuery = uniqueWords.map(w => `"${w}"*`).join(' OR ');

  if (ftsQuery) {
    try {
      const rows = db.prepare(`
        SELECT p.*, bm25(parts_fts) as score
        FROM parts_fts
        JOIN parts p ON parts_fts.id = p.id
        WHERE parts_fts MATCH ?
        ORDER BY score
        LIMIT 10
      `).all(ftsQuery);

      for (const row of rows as any[]) {
        if (!seen.has(row.id)) {
          seen.add(row.id);
          results.push({
            id: row.id,
            part_number: row.part_number,
            name: row.name,
            category: row.category,
            description: row.description,
            manufacturer: row.manufacturer,
            application_domain: row.application_domain,
            specifications: JSON.parse(row.specifications),
            oem_numbers: JSON.parse(row.oem_numbers),
            score: Math.max(0, Math.min(1, 1 - Math.abs(row.score) / 40)), // Soften FTS score drop-off
          });
        }
      }
    } catch (e) {
      console.error('FTS Error:', e);
    }
  }

  // Fallback: category match if no FTS results
  if (results.length === 0) {
    const categoryRows = db.prepare(`
      SELECT * FROM parts 
      WHERE LOWER(category) LIKE ? OR LOWER(name) LIKE ? 
      LIMIT 5
    `).all(`%${vision.part_category.toLowerCase()}%`, `%${vision.part_category.toLowerCase()}%`) as any[];

    for (const row of categoryRows) {
      results.push({
        id: row.id,
        part_number: row.part_number,
        name: row.name,
        category: row.category,
        description: row.description,
        manufacturer: row.manufacturer,
        application_domain: row.application_domain,
        specifications: JSON.parse(row.specifications),
        oem_numbers: JSON.parse(row.oem_numbers),
        score: 0.4,
      });
    }
  }

  // Boost score based on confidence
  return results
    .map(r => ({ ...r, score: Math.min(1, r.score * vision.confidence + vision.confidence * 0.3) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export function getCompatibility(partId: string): CompatibilityEntry[] {
  const db = getDb();
  return db.prepare(`
    SELECT v.make, v.model, v.year_from, v.year_to, v.engine_type
    FROM compatibility c
    JOIN vehicles v ON c.vehicle_id = v.id
    WHERE c.part_id = ?
    ORDER BY v.make, v.model
  `).all(partId) as CompatibilityEntry[];
}

export function getPartById(partId: string): PartMatch | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM parts WHERE id = ?').get(partId) as any;
  if (!row) return null;
  return {
    ...row,
    specifications: JSON.parse(row.specifications),
    oem_numbers: JSON.parse(row.oem_numbers),
    score: 1,
  };
}
