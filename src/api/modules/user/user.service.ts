import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../../database/user';
import { UserCreateDto } from './dto/user-create.dto';
import { HashService } from '../../../security/services/hash.service';

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
}
