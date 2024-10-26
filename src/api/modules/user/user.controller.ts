import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../../../security/guards/roles.guard';
import { Pagination, PaginationOptions, Roles } from '../../decorators';
import { User, UserRole } from '../../../database/user';
import { UserService } from './user.service';
import { UserCreateDto } from './dto/user-create.dto';
import { QueryOrder } from '@mikro-orm/core';

@Controller('users')
@UseGuards(RolesGuard)
@Roles([UserRole.ADMIN])
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  public async create(@Body() userCreateDto: UserCreateDto) {
    return this.userService.create(userCreateDto);
  }

  @Get()
  public async getAll(
    @Pagination<User>({
      limit: 10,
      offset: 0,
      orderBy: 'createdAt',
      order: QueryOrder.DESC,
    })
    pagination: PaginationOptions<User>,
    @Query('keyword') keyword?: string,
  ) {
    return await this.userService.getAll(keyword, pagination);
  }

  @Get(':userId')
  public async getById(@Param('userId') userId: string) {
    return await this.userService.findById(userId);
  }
}
