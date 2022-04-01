import { Logger, Module } from '@nestjs/common';
import { BatchService } from './batch.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadGroupEntity } from '../upload/entities/upload-group.entity';
import { UploadFileEntity } from '../upload/entities/upload-file.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([UploadGroupEntity, UploadFileEntity]),
    UploadModule,
  ],
  providers: [BatchService, Logger],
})
export class BatchModule {}
