import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { QueryOrder } from '@mikro-orm/core';

export type PaginatedResult<T> = {
  results: T[];
  total: number;
};

export type PaginationOptions<T = unknown> = {
  limit: number;
  offset: number;
  order?: QueryOrder;
  orderBy?: keyof T | undefined;
};

export const Pagination = createParamDecorator(
  <T = unknown>(
    defaults: Partial<PaginationOptions<T>>,
    ctx: ExecutionContext,
  ): PaginationOptions<T> => {
    const { query } = ctx.switchToHttp().getRequest();

    return {
      limit: Number(query.limit) || defaults?.limit,
      offset: Number(query.offset) || defaults?.offset,
      order: query.order || defaults?.order,
      orderBy: (query.orderBy as keyof T) || defaults?.orderBy,
    };
  },
);
