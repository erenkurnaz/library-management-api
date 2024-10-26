import * as request from 'supertest';
import { APP, clearDatabase } from '../helpers/app.helper';
import { User, UserRole } from '../../src/database/user';
import { createToken, createUser } from '../helpers/user.helper';
import { faker } from '@faker-js/faker';
import { SignInDto, SignUpDto } from '../../src/api/modules/authentication/dto';

describe('Authentication (e2e)', () => {
  const PASSWORD = '123456';
  let USER: User;

  beforeEach(async () => {
    await clearDatabase();
    USER = await createUser({ password: PASSWORD });
  });

  it('should sign in the user and return an access token', async () => {
    const requestBody = new SignInDto();
    requestBody.email = USER.email;
    requestBody.password = PASSWORD;
    return request(APP.getHttpServer())
      .post('/auth/sign-in')
      .send(requestBody)
      .expect(200)
      .expect((response) => {
        const { user, accessToken } = response.body.data;

        expect(accessToken).toBeDefined();
        expect(user.email).toEqual(user.email);
      });
  });
  it('should fail with "Invalid credentials" to sign in the user with wrong password', async () => {
    const requestBody = new SignInDto();
    requestBody.email = USER.email;
    requestBody.password = 'wrong_password';
    return request(APP.getHttpServer())
      .post('/auth/sign-in')
      .send(requestBody)
      .expect(401)
      .expect((response) => {
        expect(response.body.data).toBeNull();
        expect(response.body.error.status).toEqual(401);
        expect(response.body.error.name).toEqual('HttpException');
        expect(response.body.error.message).toEqual('Invalid credentials');
      });
  });
  it('should sign up a new user', async () => {
    const requestBody = new SignUpDto();
    requestBody.email = faker.internet.email();
    requestBody.password = faker.internet.password();
    requestBody.fullName = faker.person.fullName();

    return request(APP.getHttpServer())
      .post('/auth/sign-up')
      .send(requestBody)
      .expect(201)
      .expect((response) => {
        const { user, accessToken } = response.body.data;

        expect(accessToken).toBeDefined();
        expect(user.email).toEqual(user.email);
        expect(user.role).toEqual(UserRole.USER);
      });
  });
  it('should get the current user', async () => {
    const token = await createToken({ id: USER.id, email: USER.email });
    return request(APP.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.data.email).toEqual(USER.email);
      });
  });
});
