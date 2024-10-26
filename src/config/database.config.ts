import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { EntityGenerator } from '@mikro-orm/entity-generator';
import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';
import { RedisCacheAdapter } from 'mikro-orm-cache-adapter-redis';

export default () => {
  return defineConfig({
    driver: PostgreSqlDriver,
    discovery: {
      warnWhenNoEntities: true,
    },
    dbName: process.env.POSTGRES_DB || 'library-management',
    host: process.env.POSTGRES_HOST || 'localhost',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    //debug: true,
    ensureDatabase: true,
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    forceUtcTimezone: true,
    metadataProvider: TsMorphMetadataProvider,
    extensions: [Migrator, EntityGenerator, SeedManager],
    migrations: {
      path: './dist/migrations',
      pathTs: './src/migrations',
      transactional: true,
      allOrNothing: true,
      dropTables: false,
      disableForeignKeys: false,
      safe: false,
      emit: 'ts',
    },
    seeder: {
      path: 'seeders',
      defaultSeeder: 'DatabaseSeeder',
      glob: '!(*.d).{js,ts}',
      emit: 'ts',
      fileName: () => 'database.seeder',
    },
    resultCache: {
      adapter: RedisCacheAdapter,
      expiration: Number(process.env.REDIS_RESULT_CACHE_TTL || 15 * 1000),
      options: {
        keyPrefix: 'library-management',
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
        port: Number(process.env.REDIS_PORT),
      },
    },
  });
};
