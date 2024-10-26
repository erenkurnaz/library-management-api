import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Book } from '../../../../database/book';
import { Type } from 'class-transformer';

class AddToInventoryDto {
  @IsUUID()
  @IsString()
  storeId: string;

  @IsNumber()
  quantity: number;
}

export class BookCreateDto implements Pick<Book, 'name'> {
  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AddToInventoryDto)
  inventory: AddToInventoryDto;
}
