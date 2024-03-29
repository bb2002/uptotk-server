import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadGroupEntity } from '../upload/entities/upload-group.entity';
import { UploadFileEntity } from '../upload/entities/upload-file.entity';
import { DownloadDetailEntity } from '../download/entities/download-detail.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [AnalysisController],
  providers: [AnalysisService],
  imports: [
    CacheModule.register({
      ttl: 3600,
    }),
    TypeOrmModule.forFeature([
      UploadGroupEntity,
      UploadFileEntity,
      DownloadDetailEntity,
    ]),
  ],
})
export class AnalysisModule {}
