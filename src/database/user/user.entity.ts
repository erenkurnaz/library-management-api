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

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

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
}

export type UserDTO = EntityDTO<User>;
