import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IConfig } from '../config';
import { HashService } from './services/hash.service';
import { TokenService } from './services/token.service';
import { DatabaseModule } from '../database/database.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<IConfig, true>) => ({
        secret: config.get('jwtSecret'),
        signOptions: {
          algorithm: 'HS256',
        },
      }),
    }),
  ],
  providers: [
    HashService,
    TokenService,
    AccessTokenStrategy,
    AccessTokenGuard,
    RolesGuard,
  ],
  exports: [HashService, TokenService],
})
export class SecurityModule {}
