import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

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
  });
};
