import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BookService } from './book.service';
import { RolesGuard } from '../../../security/guards/roles.guard';
import { UserRole } from '../../../database/user';
import { BookCreateDto } from './dto/book-create.dto';
import { Roles } from '../../decorators';

@Controller('books')
@UseGuards(RolesGuard)
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  public async create(@Body() bookCreateDto: BookCreateDto) {
    return await this.bookService.create(bookCreateDto);
  }
}
