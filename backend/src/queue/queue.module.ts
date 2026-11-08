import { Global, Module, type DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { QueueName, QueueService, redisRetryStrategy } from './queue.service.js';
import { BullQueueService } from './bull-queue.service.js';
import { InlineQueueService } from './inline-queue.service.js';
import { EmailProcessor } from './processors/email.processor.js';
import { WhatsAppProcessor } from './processors/whatsapp.processor.js';
import { SMSProcessor } from './processors/sms.processor.js';

/** Redis is on unless REDIS_ENABLED is explicitly "false". */
export const isRedisEnabled = () => process.env.REDIS_ENABLED?.trim().toLowerCase() !== 'false';

@Global()
@Module({})
export class QueueModule {
  static register(): DynamicModule {
    if (!isRedisEnabled()) {
      return {
        module: QueueModule,
        providers: [{ provide: QueueService, useClass: InlineQueueService }],
        exports: [QueueService],
      };
    }

    return {
      module: QueueModule,
      imports: [
        BullModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            const redis = config.get<{ host: string; port: number; password?: string }>('app.redis')!;
            return {
              connection: {
                host: redis.host,
                port: redis.port,
                password: redis.password || undefined,
                maxRetriesPerRequest: null,
                enableReadyCheck: false,
                retryStrategy: redisRetryStrategy,
              },
            };
          },
        }),
        BullModule.registerQueue(
          { name: QueueName.EMAIL },
          { name: QueueName.WHATSAPP },
          { name: QueueName.SMS },
        ),
      ],
      providers: [
        { provide: QueueService, useClass: BullQueueService },
        EmailProcessor,
        WhatsAppProcessor,
        SMSProcessor,
      ],
      exports: [QueueService],
    };
  }
}
