import { User, UserRole } from '../../../../database/user';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class UserCreateDto
  implements Pick<User, 'email' | 'password' | 'fullName' | 'role'>
{
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsEnum(UserRole)
  role: UserRole;
}
