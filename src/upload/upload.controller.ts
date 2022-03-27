import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Inject,
  InternalServerErrorException,
  Ip,
  Logger,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerDiskOptions } from './multer-settings';
import { RealIP } from 'nestjs-real-ip';
import { UploadPostDto } from './dto/upload-post.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('/')
  @UseInterceptors(FilesInterceptor('files', 5, multerDiskOptions))
  async uploadAndPostFiles(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @RealIP() ipAddress: string,
    @Body() body,
  ) {
    let uploadPostDto: UploadPostDto = null;

    try {
      // body 데이터를 변환 후 DTO 로 생성
      body.expiredDate = Number(body?.expiredDate);
      body.downloadLimit = Number(body?.downloadLimit);
      uploadPostDto = plainToInstance(UploadPostDto, body);
    } catch (ex) {
      await this.removeUploadedFiles(files);
      throw new BadRequestException();
    }

    // DTO 검증
    const errors = await validate(uploadPostDto);
    if (errors.length > 0) {
      await this.removeUploadedFiles(files);
      throw new BadRequestException();
    }

    // Policy 검증
    const policyResult = await this.uploadService.isPostUploadAbuser(ipAddress);
    if (policyResult) {
      await this.removeUploadedFiles(files);
      throw new ForbiddenException(policyResult);
    }

    // Post 를 등록
    try {
      await this.uploadService.saveNewPost(ipAddress, files, uploadPostDto);
    } catch (ex) {
      await this.removeUploadedFiles(files);
      throw new InternalServerErrorException();
    }
  }

  /**
   * 다양한 이유로 서버에 파일이 업로드 되었으나 포스트는 등록되지 않은 경우
   * 업로드 된 모든 파일을 삭제합니다.
   * @param files 대상 파일 배열
   */
  private async removeUploadedFiles(files: Array<Express.Multer.File>) {
    for (const file of files) {
      await this.uploadService.removeFileFromDisk(
        file.destination.split('/')[0],
        file.filename,
      );
    }
  }
}
