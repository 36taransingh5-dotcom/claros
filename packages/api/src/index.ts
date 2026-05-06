import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/database.js';
import identifyRouter from './routes/identify.js';
import partsRouter from './routes/parts.js';
import historyRouter from './routes/history.js';
import feedbackRouter from './routes/feedback.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Init DB
initDatabase();

// Routes
app.use('/api', identifyRouter);
app.use('/api', partsRouter);
app.use('/api', historyRouter);
app.use('/api', feedbackRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🔧 Claros API running on http://localhost:${PORT}`);
});

export default app;
