import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryOrder } from '@mikro-orm/core';
import { BookService } from './book.service';
import { RolesGuard } from '../../../security/guards/roles.guard';
import { UserRole } from '../../../database/user';
import { BookCreateDto } from './dto/book-create.dto';
import { Pagination, PaginationOptions, Public, Roles } from '../../decorators';
import { Book } from '../../../database/book';
import { BookFilterQuery } from './dto/book-filter-query';

@Controller('books')
@UseGuards(RolesGuard)
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  public async create(@Body() bookCreateDto: BookCreateDto) {
    return await this.bookService.create(bookCreateDto);
  }

  @Get()
  @Public()
  public async getAll(
    @Pagination<Book>({
      limit: 10,
      offset: 0,
      orderBy: 'createdAt',
      order: QueryOrder.DESC,
    })
    pagination: PaginationOptions<Book>,
    @Query() filterQuery?: BookFilterQuery,
  ) {
    return await this.bookService.findBooks(filterQuery, pagination);
  }

  @Get(':bookId')
  @Public()
  public async getById(@Param('bookId') bookId: string) {
    return await this.bookService.findById(bookId);
  }
}
