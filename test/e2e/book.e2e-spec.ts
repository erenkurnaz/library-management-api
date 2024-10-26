import * as request from 'supertest';
import { APP, clearDatabase } from '../helpers/app.helper';
import { createToken, createUser } from '../helpers/user.helper';
import { UserRole } from '../../src/database/user';
import { BookCreateDto } from '../../src/api/modules/book/dto/book-create.dto';
import { HttpStatus } from '@nestjs/common';

describe('Book (e2e)', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Create Book:', () => {
    it('should allow admin to create a book', async () => {
      const user = await createUser({ role: UserRole.ADMIN });
      const adminToken = await createToken({ id: user.id, email: user.email });
      const requestBody = new BookCreateDto();
      requestBody.name = 'Book Name';
      return request(APP.getHttpServer())
        .post('/books')
        .send(requestBody)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201)
        .expect((response) => {
          const book = response.body.data;

          expect(book).toBeDefined();
          expect(book.name).toEqual(requestBody.name);
        });
    });
    it('should return 403 if the user is not an admin', async () => {
      const user = await createUser({ role: UserRole.USER });
      const token = await createToken({ id: user.id, email: user.email });
      const requestBody = new BookCreateDto();
      requestBody.name = 'Book Name';
      return request(APP.getHttpServer())
        .post('/books')
        .send(requestBody)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
    it('should return an error if name is not provided', async () => {
      const user = await createUser({ role: UserRole.ADMIN });
      const adminToken = await createToken({ id: user.id, email: user.email });
      const requestBody = new BookCreateDto();
      requestBody.name = null;
      return request(APP.getHttpServer())
        .post('/books')
        .send(requestBody)
        .set('Authorization', `Bearer ${adminToken}`)
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
});
