import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadGroupEntity } from './entities/upload-group.entity';
import { MoreThan, Repository } from 'typeorm';
import { UploadFileEntity } from './entities/upload-file.entity';
import { ConfigService } from '@nestjs/config';
import { UploadPostDto } from './dto/upload-post.dto';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(UploadGroupEntity)
    private readonly uploadGroupRepository: Repository<UploadGroupEntity>,
    @InjectRepository(UploadFileEntity)
    private readonly uploadFileRepository: Repository<UploadFileEntity>,
    private readonly configService: ConfigService,
  ) {}

  async uploadNewPost(
    ipAddress: string,
    files: Array<Express.Multer.File>,
    uploadPostDto: UploadPostDto,
  ) {

  }

  /**
   * 이 사용자가 업로드 관련 정책을 위반했는지 확인합니다.
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
}
