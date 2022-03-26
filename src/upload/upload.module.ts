import { Logger, Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadGroupEntity } from './entities/upload-group.entity';
import { UploadFileEntity } from './entities/upload-file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadController } from './upload.controller';

@Module({
  providers: [UploadService],
  controllers: [UploadController],
  imports: [TypeOrmModule.forFeature([UploadGroupEntity, UploadFileEntity])],
})
export class UploadModule {}
