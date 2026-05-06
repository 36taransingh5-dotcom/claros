import express from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/database.js';

const router = express.Router();

router.post('/feedback', (req, res) => {
  const { query_id, part_id, is_correct, notes } = req.body;
  if (!query_id || !part_id || is_correct === undefined) {
    res.status(400).json({ error: 'query_id, part_id, and is_correct are required' });
    return;
  }
  const db = getDb();
  db.prepare(`
    INSERT INTO feedback (id, query_id, part_id, is_correct, notes)
    VALUES (?, ?, ?, ?, ?)
  `).run(uuid(), query_id, part_id, is_correct ? 1 : 0, notes || null);
  res.json({ success: true });
});

export default router;
