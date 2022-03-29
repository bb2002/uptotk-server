import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadGroupEntity } from '../upload/entities/upload-group.entity';
import { Repository } from 'typeorm';
import { UploadFileEntity } from '../upload/entities/upload-file.entity';
import { AuthorizationMethodType } from '../upload/enums/file-authorization.enum';
import { UptotkExtraCode } from './enums/extra-uptotk-code.enum';

@Injectable()
export class DownloadService {
  constructor(
    @InjectRepository(UploadGroupEntity)
    private readonly uploadGroupRepository: Repository<UploadGroupEntity>,
    @InjectRepository(UploadFileEntity)
    private readonly uploadFileRepository: Repository<UploadFileEntity>,
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
    }

    if (post.currentDownloadCount >= post.maxDownloadCount) {
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

    if (post.authMethod === AuthorizationMethodType.PASSWORD) {
      // 비밀번호가 걸린 포스트라면 비밀번호를 확인한다.
      if (!password || post.password !== password) {
        post.files = null;
      }
    }

    return post;
  }
}
