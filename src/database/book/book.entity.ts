import {
  Entity,
  EntityDTO,
  EntityRepositoryType,
  Property,
} from '@mikro-orm/core';

import { BaseEntity } from '../base/base-entity';
import { BookRepository } from './book.repository';

@Entity({ repository: () => BookRepository })
export class Book extends BaseEntity {
  [EntityRepositoryType]?: BookRepository;

  @Property({ unique: true })
  name: string;
}

export type BookDTO = EntityDTO<Book>;
