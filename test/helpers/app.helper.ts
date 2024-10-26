import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from '../../src/app.module';
import { IConfig } from '../../src/config';

export let APP: INestApplication;

const init = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  APP = moduleFixture.createNestApplication();
  const configService = APP.get<ConfigService<IConfig, true>>(ConfigService);

  await APP.listen(configService.get('port') + 1);
};

export const clearDatabase = async () => {
  const orm = APP.get<MikroORM>(MikroORM);
  const schemaGenerator = orm.getSchemaGenerator();

  await schemaGenerator.refreshDatabase();
};

export const getConfig = <K extends keyof Required<IConfig>>(
  config: K,
): Required<IConfig[K]> => {
  const configService = APP.get<ConfigService<IConfig, true>>(ConfigService);
  return configService.get(config);
};

beforeAll(async () => {
  await init();
});

afterAll(async () => {
  //await clearDatabase();
  await APP.close();
});
