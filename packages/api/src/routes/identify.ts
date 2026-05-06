import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';
import { identifyPartFromImage, identifyPartFromText } from '../services/vision.js';
import { searchParts, getCompatibility } from '../services/retrieval.js';
import { getDb } from '../db/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => cb(null, `${uuid()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/identify', upload.single('image'), async (req, res) => {
  try {
    const db = getDb();
    const queryId = uuid();
    let visionResult;
    let imagePath: string | undefined;

    if (req.file) {
      imagePath = req.file.path;
      visionResult = await identifyPartFromImage(imagePath);
    } else if (req.body.text) {
      visionResult = await identifyPartFromText(req.body.text);
    } else {
      res.status(400).json({ error: 'Provide an image file or text description' });
      return;
    }

    const matches = searchParts(visionResult);

    // Get compatibility for top match
    const topMatchCompatibility = matches.length > 0 ? getCompatibility(matches[0].id) : [];

    // Save query
    db.prepare(`
      INSERT INTO queries (id, image_path, input_type, text_input, vision_result, matches)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      queryId,
      imagePath ? path.basename(imagePath) : null,
      req.file ? 'image' : 'text',
      req.body.text || null,
      JSON.stringify(visionResult),
      JSON.stringify(matches),
    );

    res.json({
      query_id: queryId,
      vision: visionResult,
      matches,
      top_compatibility: topMatchCompatibility,
    });
  } catch (err: any) {
    console.error('Identify error:', err);
    res.status(500).json({ error: err.message || 'Identification failed' });
  }
});

export default router;
