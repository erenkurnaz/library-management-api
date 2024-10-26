import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { IConfig } from './config';

const config = async (): Promise<IConfig['database']> => {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const config = app.get<ConfigService<IConfig>>(ConfigService);
  const options = config.get('database');

  await app.close();
  return options;
};

export default Promise.resolve(config());
