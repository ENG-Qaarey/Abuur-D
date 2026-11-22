import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createRoutes } from './routes';
import { config } from './config';
import { errorHandler } from './middleware/error';
import { prisma } from './prisma';
import { processScheduledNotifications } from './notifications';
import { startWorker } from './jobs/worker';

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

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(config.port, () => {
  console.log(`ABUUR backend listening on http://localhost:${config.port}/${config.apiPrefix}`);
});

setInterval(() => {
  processScheduledNotifications().catch((error) => console.error('[notifications] scheduled delivery failed', error));
}, 30_000).unref();

// Background jobs: campaigns, automations, reminders, renewals, recurring finance entries.
startWorker();

export default app;
