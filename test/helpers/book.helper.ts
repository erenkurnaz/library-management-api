import { APP } from './app.helper';
import { faker } from '@faker-js/faker';
import { Book, BookRepository } from '../../src/database/book';

export async function createBook({
  name = faker.word.words(2),
}: Partial<Book> = {}): Promise<Book> {
  const bookRepository = APP.get<BookRepository>(BookRepository);
  const createdBook = bookRepository.create({
    name,
  });
  await bookRepository.getEntityManager().flush();

  return createdBook;
}
