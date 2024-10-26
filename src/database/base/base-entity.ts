import { PrimaryKey, Property } from '@mikro-orm/core';

export abstract class BaseEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id: string;

  @Property({ default: 'now()' })
  createdAt: Date;

  @Property({
    onUpdate: () => new Date(),
    nullable: true,
  })
  updatedAt: Date | null = null;
}
