import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from '@mikro-orm/core';
import { User, UserRepository } from '../../../database/user';
import { UserCreateDto } from './dto/user-create.dto';
import { HashService } from '../../../security/services/hash.service';
import { PaginatedResult, PaginationOptions } from '../../decorators';
import { UserDetailResult } from './dto/user-detail.result';
import { UserBookRepository } from '../../../database/user-book';
import { ReturnBookDto } from './dto/return-book.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userBookRepository: UserBookRepository,
    private readonly hashService: HashService,
  ) {}

  public async create(userCreateDto: UserCreateDto) {
    userCreateDto.password = await this.hashService.hash(
      userCreateDto.password,
    );
    const createdUser = this.userRepository.create(userCreateDto);
    await this.userRepository.getEntityManager().flush();
    return createdUser;
  }

  public async getAll(keyword?: string, pagination?: PaginationOptions<User>) {
    let where: FilterQuery<User> = {};
    if (keyword) {
      where = {
        email: { $like: `%${keyword}%` },
      };
    }

    const [results, total] = await this.userRepository.findAndCount(where, {
      limit: pagination?.limit,
      offset: pagination?.offset,
      orderBy: { [pagination?.orderBy]: pagination?.order },
      fields: ['id', 'fullName', 'email'],
    });

    return <PaginatedResult<Pick<User, 'id' | 'fullName' | 'email'>>>{
      results,
      total,
    };
  }

  public async findById(userId: string) {
    const userWithBorrowHistory = await this.userRepository.findOneOrFail(
      { id: userId },
      { populate: ['borrowedBooks', 'books', 'books.book.*'] },
    );

    return <UserDetailResult>{
      id: userWithBorrowHistory.id,
      fullName: userWithBorrowHistory.fullName,
      books: userWithBorrowHistory.borrowedBooks,
    };
  }

  public async validateAndBorrowBook(userId: string, bookId: string) {
    const isBorrowed = await this.userBookRepository.checkExists({
      book: bookId,
      returnedAt: null,
    });
    if (isBorrowed)
      throw new ConflictException(
        'Book already borrowed. Please wait until returned.',
      );

    const createdUserBook = this.userBookRepository.create({
      user: userId,
      book: bookId,
      borrowedAt: new Date(),
    });
    await this.userBookRepository.getEntityManager().flush();
    return createdUserBook;
  }

  public async returnBook(
    userId: string,
    bookId: string,
    { score }: ReturnBookDto,
  ) {
    const userBookToUpdate = await this.userBookRepository.findOne({
      user: userId,
      book: bookId,
      returnedAt: null,
    });
    if (!userBookToUpdate)
      throw new NotFoundException('No record found for this book.');

    userBookToUpdate.returnedAt = new Date();
    userBookToUpdate.userScore = score;
    await this.userBookRepository.getEntityManager().flush();
    return userBookToUpdate;
  }
}
