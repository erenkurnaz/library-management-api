import * as request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import * as moment from 'moment';
import { faker } from '@faker-js/faker';
import { APP, CACHE_ADAPTER, clearDatabase } from '../helpers/app.helper';
import {
  createToken,
  createUser,
  createUserBook,
} from '../helpers/user.helper';
import { UserRole } from '../../src/database/user';
import { BookCreateDto } from '../../src/api/modules/book/dto/book-create.dto';
import { createBook } from '../helpers/book.helper';
import { Book } from '../../src/database/book';

describe('Book (e2e)', () => {
  let ADMIN_TOKEN: string;
  beforeEach(async () => {
    await clearDatabase();
    const user = await createUser({ role: UserRole.ADMIN });
    ADMIN_TOKEN = await createToken({ id: user.id, email: user.email });
  });

  describe('Create Book:', () => {
    it('should allow admin to create a book', async () => {
      const requestBody = new BookCreateDto();
      requestBody.name = 'Book Name';
      return request(APP.getHttpServer())
        .post('/books')
        .send(requestBody)
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .expect(HttpStatus.CREATED)
        .expect((response) => {
          const book = response.body.data;

          expect(book).toBeDefined();
          expect(book.name).toEqual(requestBody.name);
        });
    });
    it('should return FORBIDDEN if the user is not an admin', async () => {
      const user = await createUser({ role: UserRole.USER });
      const token = await createToken({ id: user.id, email: user.email });
      const requestBody = new BookCreateDto();
      requestBody.name = 'Book Name';
      return request(APP.getHttpServer())
        .post('/books')
        .send(requestBody)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.FORBIDDEN);
    });
    it('should return an error if name is not provided', async () => {
      const requestBody = new BookCreateDto();
      requestBody.name = null;
      return request(APP.getHttpServer())
        .post('/books')
        .send(requestBody)
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .expect(HttpStatus.BAD_REQUEST)
        .expect((response) => {
          const validationErrors = response.body.error.errors;
          expect(response.body.data).toBeNull();
          expect(validationErrors.length).toEqual(1);
          expect(response.body.error.status).toEqual(HttpStatus.BAD_REQUEST);

          expect(validationErrors[0].field).toEqual('name');
          expect(validationErrors[0].message).toEqual('name must be a string');
        });
    });
  });

  describe('List books', () => {
    let BOOKS: Book[];
    beforeEach(async () => {
      BOOKS = await Promise.all([createBook(), createBook(), createBook()]);
    });

    it('should return all books', async () => {
      return request(APP.getHttpServer())
        .get('/books')
        .expect(HttpStatus.OK)
        .expect((response) => {
          const paginatedResponse = response.body.data;

          expect(paginatedResponse).toBeDefined();
          expect(paginatedResponse.results.length).toEqual(BOOKS.length);
        });
    });
    it('should apply pagination parameters', async () => {
      const [LIMIT, OFFSET] = [1, 0];
      return request(APP.getHttpServer())
        .get(`/books?limit=${LIMIT}&offset=${OFFSET}`)
        .expect(200)
        .expect((response) => {
          const { results, total } = response.body.data;
          expect(results.length).toEqual(LIMIT);
          expect(total).toEqual(BOOKS.length);
        });
    });
    it('should apply keyword search', async () => {
      const searchedBook = BOOKS[1];
      await createBook({ name: searchedBook.name + '2' });

      const [LIMIT, OFFSET, KEYWORD] = [1, 0, searchedBook.name];
      return request(APP.getHttpServer())
        .get(`/books?limit=${LIMIT}&offset=${OFFSET}&keyword=${KEYWORD}`)
        .expect(200)
        .expect((response) => {
          const { results, total } = response.body.data;

          expect(results.length).toEqual(1);
          expect(total).toEqual(2);
        });
    });
  });

  describe('Get book', () => {
    let TOKEN: string;
    beforeEach(async () => {
      const user = await createUser();
      TOKEN = await createToken({ id: user.id, email: user.email });
    });

    it('should return book with average score', async () => {
      const user = await createUser();
      const book = await createBook();
      await Promise.all([
        createUserBook({
          book,
          user,
          userScore: 4,
          returnedAt: moment().add(1, 'day').toDate(),
        }),
        createUserBook({
          book,
          user,
          userScore: 4,
          returnedAt: moment().add(2, 'day').toDate(),
        }),
        createUserBook({
          book,
          user,
          userScore: 4,
          returnedAt: moment().add(3, 'day').toDate(),
        }),
        createUserBook({
          book,
          user,
        }),
      ]);
      return request(APP.getHttpServer())
        .get(`/books/${book.id}`)
        .set('Authorization', `Bearer ${TOKEN}`)
        .expect(HttpStatus.OK)
        .expect((response) => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.id).toEqual(book.id);
          expect(response.body.data.name).toEqual(book.name);
          expect(response.body.data.score).toEqual('4.00');
        });
    });
    it('should return book with not scored yet', async () => {
      const user = await createUser();
      const book = await createBook();
      await createUserBook({
        user,
        book,
      });
      return request(APP.getHttpServer())
        .get(`/books/${book.id}`)
        .set('Authorization', `Bearer ${TOKEN}`)
        .expect(HttpStatus.OK)
        .expect((response) => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.id).toEqual(book.id);
          expect(response.body.data.name).toEqual(book.name);
          expect(response.body.data.score).toEqual(-1);
        });
    });
    it('should return NOT_FOUND if book not exists', async () => {
      const notExistsBookId = faker.string.uuid();

      return request(APP.getHttpServer())
        .get(`/books/${notExistsBookId}`)
        .set('Authorization', `Bearer ${TOKEN}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect((response) => {
          expect(response.body.data).toBeNull();
          expect(response.body.error.status).toEqual(HttpStatus.NOT_FOUND);
          expect(response.body.error.name).toEqual('NotFoundException');
          expect(response.body.error.message).toEqual(
            `Book not found ({ id: '${notExistsBookId}' })`,
          );
        });
    });
  });
});
