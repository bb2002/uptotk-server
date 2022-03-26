import {
  BadRequestException,
  Body,
  Controller,
  Ip,
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
      throw new BadRequestException();
    }

    // DTO 검증
    const errors = await validate(uploadPostDto);
    if (errors.length > 0) {
      throw new BadRequestException();
    }



    console.log(files);
    console.log('ipAddress', ipAddress);
    console.log('dto', uploadPostDto);
  }
}
