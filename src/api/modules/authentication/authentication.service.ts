import { HttpException, Injectable } from '@nestjs/common';

import { User, UserRepository } from '../../../database/user';
import { HashService } from '../../../security/services/hash.service';
import { SignInDto, SignUpDto } from './dto';
import { TokenService } from '../../../security/services/token.service';
import { AuthResult } from './dto/auth.result';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  async register({ email, password, fullName }: SignUpDto) {
    const exists = await this.userRepository.checkExists({ email });
    if (exists) throw new HttpException('User already exists', 400);

    const createdUser = this.userRepository.create(
      {
        email,
        fullName,
        password: await this.hashService.hash(password),
      },
      { persist: true },
    );
    await this.userRepository.getEntityManager().flush();

    return this.mapResultWithTokens(createdUser);
  }

  async login({ email, password }: SignInDto) {
    const user = await this.userRepository.findOne({
      email,
    });
    if (!user) throw new HttpException('User not found', 404);

    const result = await this.hashService.verify(password, user.password);
    if (!result) throw new HttpException('Invalid credentials', 401);

    return this.mapResultWithTokens(user);
  }
  private async mapResultWithTokens(user: User): Promise<AuthResult> {
    const accessToken = await this.tokenService.generateAccessToken({
      id: user.id,
      email: user.email,
    });
    return {
      user,
      accessToken,
    };
  }
}
