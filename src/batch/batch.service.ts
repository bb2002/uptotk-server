import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadFileEntity } from '../upload/entities/upload-file.entity';
import { Repository } from 'typeorm';
import { Interval } from '@nestjs/schedule';
import { UploadGroupEntity } from '../upload/entities/upload-group.entity';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(UploadGroupEntity)
    private readonly uploadGroupRepository: Repository<UploadGroupEntity>,
    @InjectRepository(UploadFileEntity)
    private readonly uploadFileRepository: Repository<UploadFileEntity>,
    private readonly uploadService: UploadService,
    @Inject(Logger)
    private readonly logger: LoggerService,
  ) {}

  @Interval('RemoveUnusedFiles', 10000)
  async removeUnusedFilesHandler() {
    const allFileGroups = await this.uploadGroupRepository.find({
      relations: ['files'],
    });

    // 사용되지 않는 파일과 그룹을 만든다.
    const unusedGroups = allFileGroups.filter(
      (value) =>
        value.expiredAt.valueOf() < Date.now().valueOf() ||
        value.currentDownloadCount >= value.maxDownloadCount,
    );

    const unusedFiles = [] as UploadFileEntity[];
    unusedGroups.forEach((value) => unusedFiles.push(...value.files));

    // 파일 삭제
    let removedFileCount = 0;
    for (const unusedFile of unusedFiles) {
      try {
        await this.uploadService.removeFileFromDisk(
          unusedFile.folderName,
          unusedFile.savedFilename,
        );
        ++removedFileCount;
      } catch (ex) {
        this.logger.warn(ex);
      }
    }

    // DB 에서 UploadGroup 삭제
    await this.uploadGroupRepository.remove(unusedGroups);

    this.logger.log(
      `Batch completed. File removed ${removedFileCount}, Group removed ${unusedGroups.length}`,
    );
  }
}
