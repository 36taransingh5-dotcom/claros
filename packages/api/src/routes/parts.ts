import express from 'express';
import { getDb } from '../db/database.js';
import { getPartById, getCompatibility } from '../services/retrieval.js';

const router = express.Router();

router.get('/part/:id', (req, res) => {
  const part = getPartById(req.params.id);
  if (!part) { res.status(404).json({ error: 'Part not found' }); return; }
  res.json(part);
});

router.get('/compatibility/:partId', (req, res) => {
  const compat = getCompatibility(req.params.partId);
  res.json(compat);
});

router.get('/parts', (req, res) => {
  const db = getDb();
  const { category, q } = req.query as Record<string, string>;
  let query = 'SELECT * FROM parts';
  const params: string[] = [];
  if (category) { query += ' WHERE LOWER(category) = ?'; params.push(category.toLowerCase()); }
  if (q) { query += params.length ? ' AND' : ' WHERE'; query += ' search_text LIKE ?'; params.push(`%${q}%`); }
  query += ' LIMIT 50';
  res.json(db.prepare(query).all(...params));
});

export default router;
