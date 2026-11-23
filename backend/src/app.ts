import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createRoutes } from './routes';
import { config } from './config';
import { errorHandler } from './middleware/error';

/** Builds the Express app. Shared by the Node.js server (index.ts) and the Cloudflare Worker (worker.ts). */
export function createApp() {
  const app = express();

  // Trust proxy (useful behind load balancers / Supabase)
  app.set('trust proxy', 1);

  // Security & parsing
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  // Keep the raw body for webhook signature checks (Meta, Twilio).
  const keepRaw = (req: express.Request, _res: express.Response, buf: Buffer) => {
    if (req.originalUrl.includes('/webhooks/')) (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
  };
  app.use(express.json({ limit: '6mb', verify: keepRaw }));
  app.use(express.urlencoded({ extended: true, limit: '1mb', verify: keepRaw }));

  // Health check (no auth)
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes — mounted under /api prefix
  const apiRoutes = createRoutes();
  app.use(`/${config.apiPrefix}`, apiRoutes);

  // 404 — catch-all for any unmatched route (root paths suggest /api prefix)
  app.use((req, res) => {
    const suggested = req.url !== '/health' && !req.url.startsWith('/api/')
      ? ` Try: /api${req.url}`
      : '';
    res.status(404).json({
      success: false,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      message: 'Route not found' + suggested,
    });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
