import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { wrap } from '@mikro-orm/core';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokenPayload } from '../services/token.service';
import { UserRepository } from '../../database/user';
import { IConfig } from '../../config';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-token',
) {
  constructor(
    private readonly configService: ConfigService<IConfig, true>,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwtSecret'),
      passReqToCallback: false,
    });
  }

  async validate(payload: TokenPayload) {
    const user = await this.userRepository.findOne(
      { id: payload.id },
      {
        fields: ['id', 'email', 'fullName', 'role'],
      },
    );
    if (!user) throw new UnauthorizedException();

    return wrap(user).toObject();
  }
}
