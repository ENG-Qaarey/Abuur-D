/**
 * Cloudflare Workers entry for the ABUUR API (Worker "abuur-api").
 * The Node.js server entry is src/index.ts; both use the same Express app (src/app.ts).
 *
 * - HTTP: Express runs through Cloudflare's node:http support (httpServerHandler).
 * - Database: every request gets its own Prisma client (Workers can't share connections between requests).
 * - Background jobs: Cloudflare Cron Triggers (wrangler.jsonc) replace the Node.js timers.
 */
import { httpServerHandler } from 'cloudflare:node';
import { createApp } from './app';
import { createPrisma, prismaStore } from './prisma';
import { processScheduledNotifications } from './notifications';
import { runDailyJobs, runFastJobs, runSlowJobs } from './jobs/worker';

const PORT = 8080;
createApp().listen(PORT);
const http = httpServerHandler({ port: PORT });

async function withPrisma<T>(ctx: ExecutionContext, fn: () => Promise<T>): Promise<T> {
  const client = createPrisma();
  try {
    return await prismaStore.run(client, fn);
  } finally {
    ctx.waitUntil(client.$disconnect().catch(() => undefined));
  }
}

export default {
  fetch(request: Request, env: unknown, ctx: ExecutionContext) {
    return withPrisma(ctx, () => Promise.resolve(http.fetch!(request as never, env, ctx)));
  },

  async scheduled(controller: ScheduledController, _env: unknown, ctx: ExecutionContext) {
    const jobsOn = process.env.WORKER_DISABLED !== 'true';
    await withPrisma(ctx, async () => {
      if (controller.cron === '0 3 * * *') {
        if (jobsOn) await runDailyJobs();
        return;
      }
      if (controller.cron === '*/10 * * * *') {
        if (jobsOn) await runSlowJobs();
        return;
      }
      await processScheduledNotifications().catch((e) => console.error('[notifications] scheduled delivery failed', e));
      if (jobsOn) await runFastJobs();
    });
  },
} satisfies ExportedHandler;
