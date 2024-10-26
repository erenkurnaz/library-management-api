import { Injectable } from '@nestjs/common';
import { Loaded } from '@mikro-orm/core';
import { BookCreateDto } from './dto/book-create.dto';
import { Book, BookRepository } from '../../../database/book';
import { PaginatedResult, PaginationOptions } from '../../decorators';
import { BookFilterQuery } from './dto/book-filter-query';

@Injectable()
export class BookService {
  private readonly BOOKS_TTL = 30 * 1000;
  constructor(private readonly bookRepository: BookRepository) {}

  public async create(bookCreateDto: BookCreateDto) {
    return this.bookRepository.getEntityManager().transactional(async (em) => {
      const book = new Book();
      book.name = bookCreateDto.name;
      const createdBook = em.create(Book, {
        name: bookCreateDto.name,
      });
      await em.flush();
      return createdBook;
    });
  }

  public async findBooks(
    filter?: BookFilterQuery,
    pagination?: PaginationOptions<Book>,
  ): Promise<PaginatedResult<Loaded<Book, never, 'name' | 'id', never>>> {
    const [results, total] = await this.bookRepository.findAndCount(
      {
        ...(filter?.keyword && { name: { $ilike: `%${filter.keyword}%` } }),
      },
      {
        limit: pagination?.limit,
        offset: pagination?.offset,
        orderBy: { [pagination?.orderBy]: pagination?.order },
        fields: ['id', 'name'],
        cache: this.BOOKS_TTL,
      },
    );

    return {
      results,
      total,
    };
  }

  public async findById(bookId: string) {
    const book = await this.bookRepository.findOneOrFail(
      { id: bookId },
      {
        populate: ['userBook'],
        populateWhere: {
          userBook: { userScore: { $ne: null } },
        },
        fields: ['id', 'name', 'userBook', 'userBook.userScore', 'avgScore'],
      },
    );

    return {
      id: book.id,
      name: book.name,
      score: book.avgScore,
    };
  }
}
