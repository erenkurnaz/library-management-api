import { Book } from './book.entity';
import { BaseRepository } from '../base/base.repository';
import type { FilterQuery } from '@mikro-orm/core/typings';
import { PaginationOptions } from '../../api/decorators';

export const bookCacheOptions: Record<string, [string, number]> = {
  FIND_PAGINATED: ['find_paginated', 60_000],
};

export class BookRepository extends BaseRepository<Book> {
  public async getPaginatedBooks(
    where: FilterQuery<Book> = {},
    pagination: PaginationOptions<Book>,
  ) {
    const results = await this.find(where, {
      limit: pagination?.limit,
      offset: pagination?.offset,
      orderBy: { [pagination?.orderBy]: pagination?.order },
      fields: ['id', 'name'],
      cache: bookCacheOptions.FIND_PAGINATED,
    });
    const total = await this.count(where);

    return [results, total];
  }
}
