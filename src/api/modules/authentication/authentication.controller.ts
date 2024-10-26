import {
  Controller,
  Body,
  Post,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignInDto, SignUpDto } from './dto';
import { CurrentUser, Public } from '../../decorators';
import { UserDTO } from '../../../database/user';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() registerDto: SignUpDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.login(signInDto);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@CurrentUser() user: UserDTO) {
    return user;
  }
}
