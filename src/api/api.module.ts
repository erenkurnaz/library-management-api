import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SecurityModule } from '../security/security.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ResponseInterceptor, AllExceptionsFilter } from './interceptors';
import { ClassValidationPipe } from './pipes/class-validation.pipe';

@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ClassValidationPipe,
    },
  ],
})
export class ApiModule {}
