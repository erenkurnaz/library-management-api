import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/core';
import { RedisCacheAdapter } from 'mikro-orm-cache-adapter-redis';
import { AppModule } from '../../src/app.module';
import { IConfig } from '../../src/config';

export let APP: INestApplication;
export let CACHE_ADAPTER: RedisCacheAdapter;

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
  CACHE_ADAPTER = new RedisCacheAdapter({
    keyPrefix: 'library-management-test',
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: Number(process.env.REDIS_PORT),
  });
  await init();
});

afterAll(async () => {
  //await clearDatabase();
  await CACHE_ADAPTER.clear();
  await CACHE_ADAPTER.close();
  await APP.close();
});
