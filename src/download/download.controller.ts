import { Controller, Get, Param, Query } from '@nestjs/common';
import { DownloadService } from './download.service';

@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get('/file/:file')
  async downloadFile(@Param('file') file: string) {
    console.log(file);
  }

  @Get('/:easyUUID')
  async readPost(
    @Param('easyUUID') easyUUID: string,
    @Query('password') password: string,
  ) {
    return this.downloadService.readOnePost(easyUUID, password);
  }
}
