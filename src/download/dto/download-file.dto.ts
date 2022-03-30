import { IsString } from 'class-validator';

export class DownloadFileDto {
  @IsString()
  fileDownloadPath: string;

  @IsString()
  fileOriginalName: string;
}
