import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { IConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<IConfig, true>>(ConfigService);

  await app.listen(config.get('port'));

  Logger.debug(`Server is listening on ${await app.getUrl()}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  Logger.error(
    `Failed to initialize, due to: ${error}`,
    error.constructor.name,
  );
});
