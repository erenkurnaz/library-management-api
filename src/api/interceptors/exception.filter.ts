import {
  Catch,
  Logger,
  HttpStatus,
  HttpException,
  ArgumentsHost,
  ExceptionFilter,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import {
  DriverException,
  ForeignKeyConstraintViolationException,
  NotFoundError,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
import { capitalize } from 'lodash';
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

    if (
      exception instanceof DriverException ||
      exception instanceof NotFoundError
    ) {
      exception = this.normalizeDriverExceptions(exception);
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

  private normalizeDriverExceptions(dbException: DriverException) {
    if (dbException instanceof UniqueConstraintViolationException) {
      const duplicateRecordMatch = dbException.message.match(
        /insert into "([^"]+)"/,
      );
      if (duplicateRecordMatch) {
        dbException = new ConflictException(
          `${capitalize(duplicateRecordMatch?.[1])} already exists.`,
        );
      }
    }
    if (dbException instanceof ForeignKeyConstraintViolationException) {
      const missingTableMatch = dbException.message.match(
        /is not present in table "(.+?)"/,
      );
      if (missingTableMatch) {
        const missingTable = capitalize(missingTableMatch[1]);
        dbException = new NotFoundException(
          `${missingTable} not found. Please check ${missingTable} ID.`,
        );
      }
    }
    if (dbException instanceof NotFoundError) {
      dbException = new NotFoundException(dbException.message);
    }
    return dbException;
  }
}
