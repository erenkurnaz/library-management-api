import { Injectable } from '@nestjs/common';
import { EntityRepository } from '@mikro-orm/postgresql';
import { FilterQuery } from '@mikro-orm/core';

@Injectable()
export class BaseRepository<
  T extends object = any,
> extends EntityRepository<T> {
  async checkExists(filter: FilterQuery<T>): Promise<boolean> {
    const exists = await this.count(filter);
    return exists > 0;
  }
}
