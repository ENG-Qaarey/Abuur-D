import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { FileAssetController } from './file-asset.controller.js';
import { FileAssetService } from './file-asset.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [FileAssetController],
  providers: [FileAssetService],
  exports: [FileAssetService],
})
export class FileAssetModule {}
