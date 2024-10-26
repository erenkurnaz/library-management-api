import {
  Collection,
  Entity,
  EntityDTO,
  EntityRepositoryType,
  OneToMany,
  Property,
} from '@mikro-orm/core';

import { BaseEntity } from '../base/base-entity';
import { BookRepository } from './book.repository';
import { UserBook } from '../user-book';

@Entity({ repository: () => BookRepository })
export class Book extends BaseEntity {
  [EntityRepositoryType]?: BookRepository;

  @Property({ unique: true })
  name: string;

  @OneToMany(() => UserBook, (inventory) => inventory.book)
  userBook = new Collection<UserBook>(this);

  @Property({ persist: false })
  get avgScore() {
    const isInitialized = this.userBook.isInitialized();
    if (!isInitialized) return null;

    const userBooks = this.userBook.getItems();
    if (userBooks.length === 0) return -1;

    const sum = userBooks.reduce((sum, ub) => sum + (ub.userScore || 0), 0);
    return (sum / userBooks.length).toFixed(2);
  }
}

export type BookDTO = EntityDTO<Book>;
