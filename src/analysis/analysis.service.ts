import { Injectable } from '@nestjs/common';
import { UploadFileEntity } from 'src/upload/entities/upload-file.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadGroupEntity } from '../upload/entities/upload-group.entity';
import { DownloadDetailEntity } from 'src/download/entities/download-detail.entity';
import { OverviewStatusDto } from './dto/overview-status.dto';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(UploadFileEntity)
    private readonly uploadFileRepository: Repository<UploadFileEntity>,
    @InjectRepository(UploadGroupEntity)
    private readonly uploadGroupRepository: Repository<UploadGroupEntity>,
    @InjectRepository(DownloadDetailEntity)
    private readonly downloadDetailRepository: Repository<DownloadDetailEntity>,
  ) {}

  async getOverviewStatus(): Promise<OverviewStatusDto> {
    const dto = new OverviewStatusDto();

    // 공유된 모든 파일 수
    const allUploadFiles = await this.uploadFileRepository.find();
    dto.sharedFileCount = allUploadFiles.length;

    // 다운로드 수와 다운로드 트래픽
    const allDownloadDetail = await this.downloadDetailRepository.find({
      relations: ['fileEntity'],
    });
    dto.totalDownloadCount = 0;
    dto.downloadTraffic = 0;
    allDownloadDetail.forEach((value) => {
      dto.totalDownloadCount += value.currentDownloadCount;
      dto.downloadTraffic +=
        value.currentDownloadCount * value.fileEntity.fileCapacity;
    });
    dto.downloadTraffic /= 1024;

    // 업로드 트래픽
    dto.uploadTraffic = 0;
    allUploadFiles.forEach((value) => {
      dto.uploadTraffic += value.fileCapacity;
    });
    dto.uploadTraffic /= 1024;

    return dto;
  }
}
