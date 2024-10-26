import { Injectable } from '@nestjs/common';
import { FilterQuery } from '@mikro-orm/core';
import { User, UserRepository } from '../../../database/user';
import { UserCreateDto } from './dto/user-create.dto';
import { HashService } from '../../../security/services/hash.service';
import { PaginatedResult, PaginationOptions } from '../../decorators';
import { UserDetailResult } from './dto/user-detail.result';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
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
      fields: ['id', 'fullName', 'email', 'role'],
    });

    return <PaginatedResult<Pick<User, 'id' | 'fullName' | 'email' | 'role'>>>{
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
}
