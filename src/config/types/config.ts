import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';

export enum RuntimeMode {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export interface IConfig {
  mode: RuntimeMode;
  port: number;
  database: MikroOrmModuleOptions;
  jwtSecret: string;
}
