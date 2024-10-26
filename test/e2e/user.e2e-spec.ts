import * as request from 'supertest';
import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';
import * as moment from 'moment';
import { APP, clearDatabase } from '../helpers/app.helper';
import {
  createToken,
  createUser,
  createUserBook,
} from '../helpers/user.helper';
import { UserRole } from '../../src/database/user';
import { UserCreateDto } from '../../src/api/modules/user/dto/user-create.dto';
import { createBook } from '../helpers/book.helper';

describe('User Management (e2e)', () => {
  let ADMIN_TOKEN: string;

  beforeEach(async () => {
    await clearDatabase();
    const user = await createUser({ role: UserRole.ADMIN });
    ADMIN_TOKEN = await createToken({ id: user.id, email: user.email });
  });

  describe('Create User', () => {
    it('should throw 403 if user is not an admin', async () => {
      const user = await createUser({ role: UserRole.USER });
      const token = await createToken({ id: user.id, email: user.email });
      const requestBody = new UserCreateDto();
      requestBody.email = faker.internet.email();
      requestBody.fullName = faker.person.fullName();
      requestBody.password = faker.internet.password();
      requestBody.role = UserRole.USER;
      return request(APP.getHttpServer())
        .post('/users')
        .send(requestBody)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.FORBIDDEN);
    });
    it('should create a new user', async () => {
      const requestBody = new UserCreateDto();
      requestBody.email = faker.internet.email();
      requestBody.fullName = faker.person.fullName();
      requestBody.password = faker.internet.password();
      requestBody.role = UserRole.USER;

      return request(APP.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .send(requestBody)
        .expect(201)
        .expect((response) => {
          const createdUser = response.body.data;

          expect(createdUser.id).toBeDefined();
          expect(createdUser.email).toEqual(requestBody.email);
          expect(createdUser.fullName).toEqual(requestBody.fullName);
          expect(createdUser.role).toEqual(requestBody.role);
        });
    });
  });

  describe('List Users', () => {
    it('should return all users', async () => {
      const users = await Promise.all([createUser({}), createUser({})]);
      return request(APP.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .expect(200)
        .expect((response) => {
          const { results, total } = response.body.data;
          expect(results.length).toEqual(users.length + 1);
          expect(total).toEqual(users.length + 1);
        });
    });
    it('should apply pagination params', async () => {
      const [LIMIT, OFFSET] = [1, 0];
      const users = await Promise.all([createUser({}), createUser({})]);
      return request(APP.getHttpServer())
        .get(`/users?limit=${LIMIT}&offset=${OFFSET}`)
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .expect(200)
        .expect((response) => {
          const { results, total } = response.body.data;
          expect(results.length).toEqual(LIMIT);
          expect(total).toEqual(users.length + 1);
        });
    });
  });

  describe('Get User', () => {
    it('should return with borrowed books', async () => {
      const PAST_BOOK_SCORE = 1;
      const user = await createUser({});
      const pastBook = await createBook({});
      const presentBook = await createBook({});
      await Promise.all([
        createUserBook({
          book: pastBook,
          user,
          userScore: PAST_BOOK_SCORE,
          returnedAt: moment().add(1, 'day').toDate(),
        }),
        createUserBook({
          book: presentBook,
          user,
        }),
      ]);
      return request(APP.getHttpServer())
        .get(`/users/${user.id}`)
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .expect(HttpStatus.OK)
        .expect((response) => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.id).toEqual(user.id);
          expect(response.body.data.fullName).toEqual(user.fullName);

          expect(response.body.data.books.past[0]).toBeDefined();
          expect(response.body.data.books.past[0].id).toEqual(pastBook.id);
          expect(response.body.data.books.past[0].score).toEqual(
            PAST_BOOK_SCORE.toFixed(2),
          );

          expect(response.body.data.books.present[0]).toBeDefined();
          expect(response.body.data.books.present[0].id).toEqual(
            presentBook.id,
          );
        });
    });
    it('should return with empty borrowed books', async () => {
      const user = await createUser({});

      return request(APP.getHttpServer())
        .get(`/users/${user.id}`)
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .expect(HttpStatus.OK)
        .expect((response) => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.id).toEqual(user.id);
          expect(response.body.data.fullName).toEqual(user.fullName);

          expect(response.body.data.books).toMatchObject({
            past: [],
            present: [],
          });
        });
    });
    it('should return 404 if user not exists', async () => {
      const notExistsUserId = faker.string.uuid();

      return request(APP.getHttpServer())
        .get(`/users/${notExistsUserId}`)
        .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect((response) => {
          expect(response.body.data).toBeNull();
          expect(response.body.error.status).toEqual(HttpStatus.NOT_FOUND);
          expect(response.body.error.name).toEqual('NotFoundException');
          expect(response.body.error.message).toEqual(
            `User not found ({ id: '${notExistsUserId}' })`,
          );
        });
    });
  });
});
