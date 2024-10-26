import {
  Entity,
  EntityDTO,
  EntityRepositoryType,
  Enum,
  Property,
} from '@mikro-orm/core';

import { BaseEntity } from '../base/base-entity';
import { UserRepository } from './user.repository';

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
}

export type UserDTO = EntityDTO<User>;
