import { Controller, Get, Param, Query } from '@nestjs/common';
import { UploadService } from '../upload/upload.service';
import { DownloadService } from './download.service';

@Controller('download')
export class DownloadController {
  constructor(
    private readonly DownloadService: DownloadService,
    private readonly UploadService: UploadService,
  ) {}

  @Get('/file/:file')
  async downloadFile(@Param('file') file: string) {
    console.log(file);
  }

  @Get('/:easyUUID')
  async readPost(
    @Param('easyUUID') easyUUID: string,
    @Query('password') password: string,
  ) {
    console.log(easyUUID);
    console.log(password);
  }
}
