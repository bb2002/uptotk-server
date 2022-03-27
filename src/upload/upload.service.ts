import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadGroupEntity } from './entities/upload-group.entity';
import { MoreThan, Repository } from 'typeorm';
import { UploadFileEntity } from './entities/upload-file.entity';
import { ConfigService } from '@nestjs/config';
import { UploadPostDto } from './dto/upload-post.dto';
import { AuthorizationMethodType } from './enums/file-authorization.enum';
import { encryptString } from '../libs/bcrypt.util';
import { UPLOAD_PATH } from './multer-settings';
import * as fs from 'fs';
import { generateEasyUUID } from './enums/easy-english-word';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(UploadGroupEntity)
    private readonly uploadGroupRepository: Repository<UploadGroupEntity>,
    @InjectRepository(UploadFileEntity)
    private readonly uploadFileRepository: Repository<UploadFileEntity>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 새 포스트를 등록합니다.
   * @param ipAddress 등록자 IP Address
   * @param files 파일 Array
   * @param uploadPostDto 등록 데이터 DTO
   */
  async saveNewPost(
    ipAddress: string,
    files: Array<Express.Multer.File>,
    uploadPostDto: UploadPostDto,
  ) {
    if (files.length > 5) {
      throw new BadRequestException('Too many file entities');
    }

    const uploadGroup = new UploadGroupEntity();
    uploadGroup.ipAddress = ipAddress;
    uploadGroup.authMethod = uploadPostDto.authMethod;
    if (uploadPostDto.authMethod === AuthorizationMethodType.PASSWORD) {
      // 비밀번호 인증이 필요한 경우
      uploadGroup.password = await encryptString(uploadPostDto.password);
    }

    if (uploadPostDto.authMethod === AuthorizationMethodType.OPEN) {
      // 아무 인증도 필요하지 않은 경우
      uploadGroup.password = null;
    }

    // Easy UUID 만들기
    for (let i = 0; i < 5; ++i) {
      const newEasyUUID = generateEasyUUID();
      const isNotEmptyUUID = await this.uploadGroupRepository.findOne({
        where: { easyUUID: newEasyUUID },
      });
      if (!isNotEmptyUUID) {
        uploadGroup.easyUUID = newEasyUUID;
        break;
      }
    }
    if (!uploadGroup.easyUUID) {
      // 5회 이내로 EasyUUID 를 만들어내지 못한경우
      // HARD 한 UUID 를 사용하도록 한다
      uploadGroup.easyUUID = uuidv4().split('-')[0];
    }

    uploadGroup.currentDownloadCount = 0;
    uploadGroup.maxDownloadCount = uploadPostDto.downloadLimit;
    uploadGroup.files = files.map((value) => {
      const file = new UploadFileEntity();
      file.uploadGroup = uploadGroup;
      file.fileCapacity = value.size / 1024; // byte to kb
      file.savedFilename = value.filename;
      file.folderName = value.destination.split('/')[1];
      file.mimeType = value.mimetype;
      file.originalFilename = value.originalname;
      return file;
    });
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + uploadPostDto.expiredDate);
    uploadGroup.expiredAt = expiredAt;

    // UploadGroupEntity 를 저장
    await this.uploadGroupRepository.save(uploadGroup);

    // UploadFileEntity 를 저장
    for (let i = 0; i < uploadGroup.files.length; ++i) {
      await this.uploadFileRepository.save(uploadGroup.files[i]);
    }

    return {
      easyUUID: uploadGroup.easyUUID,
    };
  }

  /**
   * 이 사용자가 업로드 관련 정책을 위반했는지 확인합니다.
   * @param ipAddress 등록자 IP 주소
   */
  async isPostUploadAbuser(ipAddress: string): Promise<string | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘 올린 포스트가 몇 개인지 조회합니다.
    const todayUploadPosts = await this.uploadGroupRepository.find({
      where: {
        ipAddress,
        createdAt: MoreThan(today),
      },
      relations: ['files'],
    });

    if (todayUploadPosts.length > 0) {
      const maxPostCntPerDay = Number(
        this.configService.get('MAX_POST_CNT_PER_DAY'),
      );

      if (todayUploadPosts.length >= maxPostCntPerDay) {
        // 당일 업로드 횟수 초과
        return 'You have exceeded the limit you can upload today.';
      }
    }

    // TODO
    // 그 외 정책을 추가적으로 이곳에 서술하면 됩니다.
    return null;
  }

  /**
   * 업로드 된 파일 한 개를 찾아서 삭제합니다.
   */
  async removeFileFromDisk(
    folderName: string,
    savedFilename: string,
  ): Promise<void> {
    const filePath = `${UPLOAD_PATH}/${folderName}/${savedFilename}`;

    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
