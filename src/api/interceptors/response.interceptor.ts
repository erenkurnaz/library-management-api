import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AppResponse<T> {
  data: T;
  error: unknown | Error;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, AppResponse<T>>
{
  intercept(
    _: ExecutionContext,
    next: CallHandler,
  ): Observable<AppResponse<T>> {
    return next
      .handle()
      .pipe(map<T, AppResponse<T>>((data) => ({ data: data, error: null })));
  }
}
