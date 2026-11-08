import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { IntegrationConnectionController } from './integration-connection.controller.js';
import { IntegrationConnectionService } from './integration-connection.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [IntegrationConnectionController],
  providers: [IntegrationConnectionService],
  exports: [IntegrationConnectionService],
})
export class IntegrationConnectionModule {}
