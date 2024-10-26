import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface TokenPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class TokenService {
  private readonly accessTokenExpires = '7d';

  constructor(private readonly jwtService: JwtService) {}

  public async generateAccessToken(payload: TokenPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      expiresIn: this.accessTokenExpires,
    });
  }
}
