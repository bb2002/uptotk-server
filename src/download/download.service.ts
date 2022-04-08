import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadGroupEntity } from '../upload/entities/upload-group.entity';
import { Repository } from 'typeorm';
import { UploadFileEntity } from '../upload/entities/upload-file.entity';
import { AuthorizationMethodType } from '../upload/enums/file-authorization.enum';
import { UptotkExtraCode } from './enums/extra-uptotk-code.enum';
import { compareString } from '../libs/bcrypt.util';
import { DownloadDetailEntity } from './entities/download-detail.entity';
import { UPLOAD_PATH } from 'src/upload/multer-settings';
import { DownloadFileDto } from './dto/download-file.dto';
import * as fs from 'fs';

@Injectable()
export class DownloadService {
  constructor(
    @InjectRepository(UploadGroupEntity)
    private readonly uploadGroupRepository: Repository<UploadGroupEntity>,
    @InjectRepository(UploadFileEntity)
    private readonly uploadFileRepository: Repository<UploadFileEntity>,
    @InjectRepository(DownloadDetailEntity)
    private readonly downloadDetailEntity: Repository<DownloadDetailEntity>,
  ) {}

  /**
   * 업로드 포스트 하나를 읽어옵니다.
   * @param easyUUID 대상 easy uuid
   * @param password 비밀번호 걸린 포스트라면 대상 비밀번호
   */
  async readOnePost(easyUUID: string, password?: string) {
    const post = await this.uploadGroupRepository.findOne({
      where: { easyUUID },
      relations: ['files'],
    });

    if (!post) {
      // Post 를 찾을 수 없는 경우
      throw new NotFoundException();
    } else {
      // Post 가 있는 경우, Validation 진행
      this.checkPostValidation(post);
    }

    if (post.authMethod === AuthorizationMethodType.PASSWORD) {
      // 비밀번호가 걸린 포스트라면 비밀번호를 확인한다.
      if (!password || !(await compareString(password, post.password))) {
        post.files = null;
      }
    }

    // 필요 없는 정보는 삭제
    delete post.password;
    delete post._id;
    delete post.ipAddress;
    return post;
  }

  /**
   * 파일 한 개를 다운로드 합니다.
   * @param savedFilename 대상 파일의 저장된 파일 명
   * @param ipAddress 다운로드 하는 유저의 ip address
   */
  async downloadFile(
    savedFilename: string,
    ipAddress: string,
    password: string,
  ): Promise<DownloadFileDto> {
    const fileEntity = await this.uploadFileRepository.findOne({
      where: { savedFilename },
      relations: ['uploadGroup'],
    });

    if (!fileEntity || !fileEntity.uploadGroup) {
      // 파일이 없거나, 파일 그룹이 없는 경우
      throw new NotFoundException();
    }

    if (
      fileEntity.uploadGroup.authMethod === AuthorizationMethodType.PASSWORD
    ) {
      // 인증방식이 Password 인 파일이면 비밀번호를 줘야 다운로드 가능
      if (
        !password ||
        !(await compareString(password, fileEntity.uploadGroup.password))
      ) {
        throw new ForbiddenException('Password not matched');
      }
    }

    const fileDownloadPath = `${UPLOAD_PATH}/${fileEntity.folderName}/${fileEntity.savedFilename}`;

    // 파일이 있는 경우, Validation 진행
    this.checkPostValidation(fileEntity.uploadGroup);
    if (!fs.existsSync(fileDownloadPath)) {
      throw new InternalServerErrorException('Current file missed.');
    }

    // 다운로드 기록을 저장
    await this.recordDownloadDetail(fileEntity, ipAddress);

    // 최종 다운로드 경로 반환
    return {
      fileDownloadPath,
      fileOriginalName: fileEntity.originalFilename,
    };
  }

  /**
   * 해당 파일을 다운로드 하는 경우, download_detail 과 upload_group 의 통계 수치를 업데이트 한다.
   * @param fileEntity
   * @param ipAddress
   * @private
   */
  private async recordDownloadDetail(
    fileEntity: UploadFileEntity,
    ipAddress: string,
  ) {
    const downloadDetail = await this.downloadDetailEntity.findOne({
      where: {
        fileEntity: { _id: fileEntity._id },
        ipAddress,
      },
    });

    // uk_upload_groups 를 업데이트 한다.
    const uploadGroup = await this.uploadGroupRepository.findOne({
      where: {
        _id: fileEntity.uploadGroup._id,
      },
      relations: ['files'],
    });

    if (!uploadGroup) {
      // 업로드 그룹을 찾을 수 없는 경우
      throw new InternalServerErrorException('UploadGroup not found.');
    }

    const where = uploadGroup.files.map((value) => ({
      fileEntity: { _id: value._id },
    }));

    // UploadGroup 에 포함된 파일들 중 한번이라도 다운로드 한 경험이 있는지 확인
    const downloadDetailUploadGroup = await this.downloadDetailEntity.findOne({
      where,
    });
    if (!downloadDetailUploadGroup) {
      uploadGroup.currentDownloadCount += 1;
      await this.uploadGroupRepository.save(uploadGroup);
    }

    // uk_download_details 를 업데이트 한다.
    if (downloadDetail) {
      // 이전에 해당 파일을 다운로드한 경험이 있는 경우
      downloadDetail.currentDownloadCount += 1;
      await this.downloadDetailEntity.save(downloadDetail);
    } else {
      // 처음 이 파일을 다운로드 하는 경우
      const newDownloadDetail = new DownloadDetailEntity();
      newDownloadDetail.currentDownloadCount = 1;
      newDownloadDetail.fileEntity = fileEntity;
      newDownloadDetail.ipAddress = ipAddress;
      await this.downloadDetailEntity.save(newDownloadDetail);
    }
  }

  /**
   * 해당 Post 가 사용 가능한 상태인지 확인합니다.
   * @param post 대상 Post
   */
  private checkPostValidation(post: UploadGroupEntity) {
    if (post.maxDownloadCount !== 0 && post.currentDownloadCount >= post.maxDownloadCount) {
      // 다운로드 횟수를 초과한 경우
      throw new ForbiddenException({
        message: 'Exceeded max download count.',
        code: UptotkExtraCode.EXCEED_MAX_DOWNLOAD_COUNT,
      });
    }

    if (post.expiredAt.valueOf() < Date.now().valueOf()) {
      // 만료 기간이 지난 경우
      throw new ForbiddenException({
        message: 'The file has expired.',
        code: UptotkExtraCode.EXPIRED_FILE_DATE,
      });
    }
  }
}
