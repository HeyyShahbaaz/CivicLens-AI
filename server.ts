import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import reportsRouter from './backend/routes/reports.js';
import { getDatabase } from './backend/db/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  console.log('[CivicLens AI] Bootstrapping persistent SQLite database...');
  await getDatabase();

  // Increase payload limit for base64 image uploads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Security & Diagnostics headers
  app.use((_req, res, next) => {
    res.setHeader('X-Powered-By', 'CivicLens AI / Open-Source Edition');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

  // REST API Routes
  app.use('/api', reportsRouter);

  // Error handling middleware for API routes
  app.use('/api', (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[API Error caught in global handler]:', err);
    res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: err.message || 'An unexpected server error occurred.'
    });
  });

  // Vite integration
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('[CivicLens AI] Mounted Vite SPA middleware in development mode.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[CivicLens AI] Serving static production bundle from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CivicLens AI Server] Successfully listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CivicLens AI] Fatal startup error:', err);
  process.exit(1);
});
