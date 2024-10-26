import * as request from 'supertest';
import { APP, clearDatabase } from '../helpers/app.helper';
import { createToken, createUser } from '../helpers/user.helper';
import { UserRole } from '../../src/database/user';
import { UserCreateDto } from '../../src/api/modules/user/dto/user-create.dto';
import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';

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
});
