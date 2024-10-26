import { User } from '../../../../database/user';

export type AuthResult = {
  user: User;
  accessToken: string;
};
