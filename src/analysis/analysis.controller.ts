import {
  CacheInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  /**
   * 우리 서비스의 전반적인 통계를 전달합니다.
   */
  @UseInterceptors(CacheInterceptor)
  @Get('/overview')
  async getSiteOverviewStatus() {
    return this.analysisService.getOverviewStatus();
  }
}
