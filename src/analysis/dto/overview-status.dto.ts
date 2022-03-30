import { IsNumber } from 'class-validator';

export class OverviewStatusDto {
  // 공유된 파일 수
  @IsNumber()
  sharedFileCount: number;

  // 다운로드 수
  @IsNumber()
  totalDownloadCount: number;

  // 총 다운로드 트래픽 (MB 단위)
  @IsNumber()
  downloadTraffic: number;

  // 총 업로드 트래픽 (MB 단위)
  @IsNumber()
  uploadTraffic: number;
}
