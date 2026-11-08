import { Module } from '@nestjs/common';
import { ContactMessageController } from './contact-message.controller.js';
import { ContactMessageService } from './contact-message.service.js';

@Module({
  controllers: [ContactMessageController],
  providers: [ContactMessageService],
})
export class ContactMessageModule {}
