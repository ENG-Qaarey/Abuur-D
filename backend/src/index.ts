import { createApp } from './app';
import { config } from './config';
import { prisma } from './prisma';
import { processScheduledNotifications } from './notifications';
import { startWorker } from './jobs/worker';

// Node.js server entry. The Cloudflare Worker entry is src/worker.ts.
const app = createApp();

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
