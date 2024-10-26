import {
  Collection,
  Entity,
  EntityDTO,
  EntityRepositoryType,
  Enum,
  OneToMany,
  Property,
} from '@mikro-orm/core';

import { BaseEntity } from '../base/base-entity';
import { UserRepository } from './user.repository';
import { UserBook } from '../user-book';
import { Book } from '../book';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export type BorrowedBooks = {
  past: Book[];
  present: Book[];
};

@Entity({ repository: () => UserRepository })
export class User extends BaseEntity {
  [EntityRepositoryType]?: UserRepository;

  @Property({ unique: true })
  email: string;

  @Property({ hidden: true })
  password: string;

  @Property()
  fullName: string;

  @Enum({
    items: () => UserRole,
    default: UserRole.USER,
    nativeEnumName: 'user_role',
  })
  role: UserRole;

  @OneToMany(() => UserBook, (inventory) => inventory.user)
  books = new Collection<UserBook>(this);

  @Property({ persist: false, hidden: true })
  get borrowedBooks(): BorrowedBooks {
    const isInitialized = this.books.isInitialized();
    if (!isInitialized) return null;

    const userBooks = this.books.getItems();
    return userBooks.reduce(
      (acc, { book: { id, name }, returnedAt, userScore }) => {
        const target = returnedAt ? 'past' : 'present';
        acc[target].push(
          returnedAt
            ? { id, name, userScore: userScore.toFixed(2) }
            : { id, name },
        );
        return acc;
      },
      { past: [], present: [] },
    );
  }
}

export type UserDTO = EntityDTO<User>;
