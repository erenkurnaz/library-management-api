import {
  Entity,
  EntityDTO,
  EntityRepositoryType,
  ManyToOne,
  Property,
} from '@mikro-orm/core';

import { Book } from '../book';
import { User } from '../user';
import { UserBookRepository } from './user-book.repository';
import { BaseEntity } from '../base/base-entity';

@Entity({ repository: () => UserBookRepository })
export class UserBook extends BaseEntity {
  [EntityRepositoryType]?: UserBookRepository;

  @ManyToOne(() => Book, { primary: true })
  book: Book;

  @ManyToOne(() => User, { primary: true })
  user: User;

  @Property({ nullable: true })
  returnedAt: Date | null = null;

  @Property({ nullable: true })
  borrowedAt: Date | null = null;

  @Property({ nullable: true })
  userScore: number | null = null;
}

export type UserBookDTO = EntityDTO<UserBook>;
