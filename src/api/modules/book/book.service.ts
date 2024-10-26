import { Injectable } from '@nestjs/common';
import { BookCreateDto } from './dto/book-create.dto';
import { Book, bookCacheOptions, BookRepository } from '../../../database/book';
import { PaginationOptions } from '../../decorators';
import { BookFilterQuery } from './dto/book-filter-query';

@Injectable()
export class BookService {
  constructor(private readonly bookRepository: BookRepository) {}

  public async create(bookCreateDto: BookCreateDto) {
    return this.bookRepository.getEntityManager().transactional(async (em) => {
      const book = new Book();
      book.name = bookCreateDto.name;
      const createdBook = em.create(Book, {
        name: bookCreateDto.name,
      });
      await em.flush();
      await em.clearCache(bookCacheOptions.FIND_PAGINATED[0]);
      return createdBook;
    });
  }

  public async findBooks(
    filter?: BookFilterQuery,
    pagination?: PaginationOptions<Book>,
  ) {
    const query = filter?.keyword && {
      name: { $ilike: `%${filter.keyword}%` },
    };

    const [results, total] = await this.bookRepository.getPaginatedBooks(
      query,
      pagination,
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
