import {
  Catch,
  Logger,
  HttpStatus,
  HttpException,
  ArgumentsHost,
  ExceptionFilter,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { IConfig, RuntimeMode } from '../../config';
import { ValidationException } from '../pipes/class-validation.pipe';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly config: ConfigService<IConfig, true>,
  ) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    if (this.config.get('mode') === RuntimeMode.DEVELOPMENT) {
      Logger.error(`Error Stack: ${exception.stack}`, 'ExceptionFilter');
    }

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      data: null,
      error: {
        status: httpStatus,
        name: exception.name,
        message: exception.message,
        ...(exception instanceof ValidationException && {
          errors: exception.errors,
        }),
        timestamp: Date.now(),
      },
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
