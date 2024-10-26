import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { User, UserRepository } from './user';
import { EntityManager } from '@mikro-orm/postgresql';
import { Book, BookRepository } from './book';

@Module({
  imports: [MikroOrmModule.forFeature([User, Book])],
  providers: [
    {
      provide: UserRepository,
      useFactory: (em: EntityManager) => em.getRepository(User),
      inject: [EntityManager],
    },
    {
      provide: BookRepository,
      useFactory: (em: EntityManager) => em.getRepository(Book),
      inject: [EntityManager],
    },
  ],
  exports: [UserRepository, BookRepository],
})
export class DatabaseModule {}
