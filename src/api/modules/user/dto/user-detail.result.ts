import { BorrowedBooks, User } from '../../../../database/user';

export type UserDetailResult = Pick<User, 'id' | 'fullName'> & {
  books: BorrowedBooks;
};
