import type { Logger } from '@nestjs/common';
import { InlineQueueService } from './inline-queue.service.js';
import { redisRetryStrategy, throttledErrorLogger } from './queue.service.js';
import { isRedisEnabled } from './queue.module.js';

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe('InlineQueueService (REDIS_ENABLED=false)', () => {
  const email = { sendEmail: vi.fn().mockResolvedValue({ success: true }) };
  const whatsapp = { sendMessage: vi.fn().mockResolvedValue({ success: true }) };
  const sms = { sendSMS: vi.fn().mockRejectedValue(new Error('provider down')) };
  const queue = new InlineQueueService(email as never, whatsapp as never, sms as never);

  it('sends right away and returns a job id without waiting for the provider', async () => {
    const job = await queue.addEmailJob({ to: 'a@x.so', subject: 's', html: '<p>h</p>' });
    expect(job.id).toMatch(/^inline-/);
    await flush();
    expect(email.sendEmail).toHaveBeenCalledWith({ to: 'a@x.so', subject: 's', html: '<p>h</p>' });

    await queue.addWhatsAppJob({ to: '+252610000000', message: 'Order #1001 confirmed' });
    await flush();
    expect(whatsapp.sendMessage).toHaveBeenCalled();
  });

  it('a failing provider is logged, never thrown at the caller', async () => {
    await expect(queue.addSMSJob({ to: '+252610000000', message: 'hi' })).resolves.toBeDefined();
    await flush();
    await flush();
    expect(sms.sendSMS).toHaveBeenCalled();
  });
});

describe('throttledErrorLogger', () => {
  it('logs once per interval and reports how many were suppressed', () => {
    vi.useFakeTimers();
    const logger = { error: vi.fn() } as unknown as Logger;
    const log = throttledErrorLogger(logger, 'Redis down', 60_000);

    for (let i = 0; i < 50; i++) log(new Error('ECONNREFUSED'));
    expect(logger.error).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(60_000);
    log(new Error('ECONNREFUSED'));
    expect(logger.error).toHaveBeenCalledTimes(2);
    expect(vi.mocked(logger.error).mock.calls[1][0]).toContain('49 similar errors suppressed');
    vi.useRealTimers();
  });

  it('shows the real cause of an AggregateError instead of an empty message', () => {
    const logger = { error: vi.fn() } as unknown as Logger;
    const err = new AggregateError([new Error('connect ECONNREFUSED 127.0.0.1:6379')], '');
    throttledErrorLogger(logger, 'Redis down')(err);
    expect(vi.mocked(logger.error).mock.calls[0][0]).toBe('Redis down: connect ECONNREFUSED 127.0.0.1:6379');
  });
});

describe('Redis settings', () => {
  it('backs off reconnects up to 30s', () => {
    expect(redisRetryStrategy(1)).toBe(1000);
    expect(redisRetryStrategy(100)).toBe(30_000);
  });

  it('Redis stays on unless REDIS_ENABLED is exactly "false"', () => {
    const original = process.env.REDIS_ENABLED;
    for (const [value, expected] of [[undefined, true], ['true', true], ['false', false], [' FALSE ', false]] as const) {
      if (value === undefined) delete process.env.REDIS_ENABLED;
      else process.env.REDIS_ENABLED = value;
      expect(isRedisEnabled()).toBe(expected);
    }
    process.env.REDIS_ENABLED = original;
  });
});
