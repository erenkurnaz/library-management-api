import { IConfig, RuntimeMode } from './types/config';
import * as process from 'process';
import databaseConfig from './database.config';

export const configuration = (): IConfig => {
  const RUNTIME_MODE = <RuntimeMode>process.env.MODE || RuntimeMode.DEVELOPMENT;

  return {
    mode: RUNTIME_MODE,
    port: Number(process.env.PORT),
    database: {
      allowGlobalContext: true,
      ...databaseConfig(),
    },
    jwtSecret: process.env.JWT_SECRET,
  };
};
