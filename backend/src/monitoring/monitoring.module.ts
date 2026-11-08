import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SentryService } from './sentry.service.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SentryService],
  exports: [SentryService],
})
export class MonitoringModule {}
