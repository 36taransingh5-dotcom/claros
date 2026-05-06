import express from 'express';
import { getDb } from '../db/database.js';

const router = express.Router();

router.get('/history', (_req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT q.id, q.image_path, q.input_type, q.text_input, q.created_at,
           q.vision_result, q.matches
    FROM queries q
    ORDER BY q.created_at DESC
    LIMIT 50
  `).all() as any[];

  res.json(rows.map(r => ({
    id: r.id,
    image_path: r.image_path ? `/uploads/${r.image_path}` : null,
    input_type: r.input_type,
    text_input: r.text_input,
    created_at: r.created_at,
    vision: r.vision_result ? JSON.parse(r.vision_result) : null,
    matches: r.matches ? JSON.parse(r.matches) : [],
  })));
});

router.get('/history/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM queries WHERE id = ?').get(req.params.id) as any;
  if (!row) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({
    ...row,
    vision: row.vision_result ? JSON.parse(row.vision_result) : null,
    matches: row.matches ? JSON.parse(row.matches) : [],
  });
});

export default router;
