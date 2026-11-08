import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryService implements OnModuleInit {
  private readonly logger = new Logger(SentryService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const dsn = (this.configService.get<string>('app.sentry.dsn') ?? '').trim();

    // Empty, or the example placeholder from .env.example ("your-key"/"your-project").
    if (!dsn || /your-key|your-project/i.test(dsn)) {
      this.logger.warn('SENTRY_DSN not configured. Skipping Sentry initialization.');
      return;
    }

    const isProduction = this.configService.get('app.nodeEnv') === 'production';
    Sentry.init({
      dsn,
      environment: this.configService.get('app.nodeEnv'),
      release: process.env.npm_package_version ?? '1.0.0',
      // Tracing every request is expensive in production; sample 10% there.
      tracesSampleRate: isProduction ? 0.1 : 1.0,
    });

    if (!Sentry.getClient()?.getDsn()) {
      this.logger.warn('SENTRY_DSN is invalid. Sentry is disabled.');
      return;
    }
    this.logger.log('Sentry initialized');
  }

  captureException(exception: unknown, context?: Record<string, unknown>) {
    Sentry.captureException(exception, { extra: context });
  }

  captureMessage(message: string, level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug') {
    Sentry.captureMessage(message, level);
  }

  setUser(user: { id: string; email?: string; role?: string }) {
    Sentry.setUser(user);
  }

  setTag(key: string, value: string) {
    Sentry.setTag(key, value);
  }

  setContext(name: string, context: Record<string, unknown>) {
    Sentry.setContext(name, context);
  }
}
