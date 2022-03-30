import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { DownloadService } from './download.service';
import { RealIp } from 'nestjs-real-ip';
import { Response } from 'express';

@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get('/file/:savedFilename')
  async downloadFile(
    @Param('savedFilename') savedFilename: string,
    @RealIp() ipAddress: string,
    @Res() res: Response,
  ) {
    const fileDownloadDto = await this.downloadService.downloadFile(
      savedFilename,
      ipAddress,
    );

    res.download(
      fileDownloadDto.fileDownloadPath,
      fileDownloadDto.fileOriginalName,
    );
  }

  @Get('/:easyUUID')
  async readPost(
    @Param('easyUUID') easyUUID: string,
    @Query('password') password: string,
  ) {
    return this.downloadService.readOnePost(easyUUID, password);
  }
}
