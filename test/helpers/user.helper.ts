import { APP } from './app.helper';
import {
  TokenPayload,
  TokenService,
} from '../../src/security/services/token.service';
import { User, UserRepository, UserRole } from '../../src/database/user';
import { faker } from '@faker-js/faker';
import { HashService } from '../../src/security/services/hash.service';

export async function createUser({
  email = faker.internet.email(),
  password = faker.internet.password(),
  fullName = faker.person.fullName(),
  role = UserRole.USER,
}: Partial<User>): Promise<User> {
  const userRepository = APP.get<UserRepository>(UserRepository);
  const hashService = APP.get(HashService);
  const user = new User();
  user.email = email;
  user.password = await hashService.hash(password);
  user.fullName = fullName;
  user.role = role;

  const createdUser = userRepository.create(user);
  await userRepository.getEntityManager().flush();

  return createdUser;
}

export function createToken({ id, email }: TokenPayload): Promise<string> {
  const tokenService = APP.get<TokenService>(TokenService);

  return tokenService.generateAccessToken({ id, email });
}
