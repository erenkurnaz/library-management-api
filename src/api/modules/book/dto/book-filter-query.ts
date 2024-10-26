import { IsOptional, IsString } from 'class-validator';

export class BookFilterQuery {
  @IsOptional()
  @IsString()
  keyword: string;
}
