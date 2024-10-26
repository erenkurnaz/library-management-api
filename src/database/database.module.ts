import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { User, UserRepository } from './user';
import { EntityManager } from '@mikro-orm/postgresql';
import { Book, BookRepository } from './book';
import { UserBook, UserBookRepository } from './user-book';

@Module({
  imports: [MikroOrmModule.forFeature([User, Book, UserBook])],
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
    {
      provide: UserBookRepository,
      useFactory: (em: EntityManager) => em.getRepository(UserBook),
      inject: [EntityManager],
    },
  ],
  exports: [UserRepository, BookRepository, UserBookRepository],
})
export class DatabaseModule {}
