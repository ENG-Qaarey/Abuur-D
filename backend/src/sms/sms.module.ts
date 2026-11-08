import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SMSService } from './sms.service.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SMSService],
  exports: [SMSService],
})
export class SMSModule {}
