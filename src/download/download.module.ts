import { Module } from '@nestjs/common';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';
import { UploadModule } from '../upload/upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [DownloadController],
  providers: [DownloadService],
  imports: [TypeOrmModule.forFeature([]), UploadModule],
})
export class DownloadModule {}
