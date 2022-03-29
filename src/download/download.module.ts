import { Module } from '@nestjs/common';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';
import { UploadModule } from '../upload/upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadGroupEntity } from '../upload/entities/upload-group.entity';
import { UploadFileEntity } from '../upload/entities/upload-file.entity';

@Module({
  controllers: [DownloadController],
  providers: [DownloadService],
  imports: [
    TypeOrmModule.forFeature([UploadGroupEntity, UploadFileEntity]),
    UploadModule,
  ],
})
export class DownloadModule {}
