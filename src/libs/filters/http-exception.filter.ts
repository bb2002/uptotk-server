import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  LoggerService,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest<Request>();

    if (!(exception instanceof HttpException)) {
      exception = new InternalServerErrorException();
    }

    const response = (exception as HttpException).getResponse() as {
      statusCode: number;
    };

    const log = {
      timestamp: new Date(),
      url: req.url,
      response,
    };

    // 500 또는 statusCode 가 없는 경우에는 로그 찍기
    if (!response.statusCode || response.statusCode >= 500) {
      this.logger.error(exception);
    }

    res.status((exception as HttpException).getStatus()).json(log);
  }
}
