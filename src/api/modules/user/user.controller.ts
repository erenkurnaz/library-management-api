import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../../security/guards/roles.guard';
import { Roles } from '../../decorators';
import { UserRole } from '../../../database/user';
import { UserService } from './user.service';
import { UserCreateDto } from './dto/user-create.dto';

@Controller('users')
@UseGuards(RolesGuard)
@Roles([UserRole.ADMIN])
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  public async create(@Body() userCreateDto: UserCreateDto) {
    return this.userService.create(userCreateDto);
  }
}
