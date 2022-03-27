import {
  CallHandler,
  ExecutionContext,
  Injectable,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const now = new Date();
    const req = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `${req.method} ${req.url} - ${
            Date.now().valueOf() - now.valueOf()
          }ms`,
        );
      }),
    );
  }
}
