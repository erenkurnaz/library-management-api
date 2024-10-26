import { IsNumber, Max, Min } from 'class-validator';

export class ReturnBookDto {
  @IsNumber()
  @Max(10)
  @Min(0)
  score: number;
}
