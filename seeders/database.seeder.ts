import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import moment from 'moment';

import { UserRole, User } from '../src/database/user';
import { Book } from '../src/database/book';
import { UserBook } from '../src/database/user-book';
import { HashService } from '../src/security/services/hash.service';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const hashService = new HashService();
    const hashedPassword = await hashService.hash('password');
    const users = [
      {
        fullName: 'Darth Vader',
        email: 'darthvader@mail.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
      {
        fullName: 'Obi-Wan Kenobi',
        email: 'obiwankenobi@mail.com',
        password: hashedPassword,
        role: UserRole.USER,
      },
      {
        fullName: 'Qui-Gon Jinn',
        email: 'quigonjinn@mail.com',
        password: hashedPassword,
        role: UserRole.USER,
      },
    ].map((user) => em.create(User, user));

    const books = [
      { name: 'Star Wars: A New Hope' },
      { name: 'Star Wars: The Empire Strikes Back' },
      { name: 'Star Wars: Return of the Jedi' },
      { name: 'Star Wars: The Phantom Menace' },
      { name: 'Star Wars: Attack of the Clones' },
      { name: 'Star Wars: Revenge of the Sith' },
      { name: 'Star Wars: The Force Awakens' },
      { name: 'Star Wars: The Last Jedi' },
      { name: 'Star Wars: The Rise of Skywalker' },
    ].map((book) => em.create(Book, book));

    [
      // 6 records for Qui-Gon in more recent date order
      {
        book: books[0],
        user: users[2],
        borrowedAt: moment().subtract(12, 'days').toDate(),
        returnedAt: moment().subtract(11, 'days').toDate(),
        userScore: 8,
      },
      {
        book: books[1],
        user: users[2],
        borrowedAt: moment().subtract(10, 'days').toDate(),
        returnedAt: moment().subtract(9, 'days').toDate(),
        userScore: 9,
      },
      {
        book: books[2],
        user: users[2],
        borrowedAt: moment().subtract(8, 'days').toDate(),
        returnedAt: moment().subtract(7, 'days').toDate(),
        userScore: 7,
      },
      {
        book: books[3],
        user: users[2],
        borrowedAt: moment().subtract(6, 'days').toDate(),
        returnedAt: moment().subtract(5, 'days').toDate(),
        userScore: 8,
      },
      {
        book: books[4],
        user: users[2],
        borrowedAt: moment().subtract(4, 'days').toDate(),
        returnedAt: moment().subtract(3, 'days').toDate(),
        userScore: 6,
      },
      {
        book: books[5],
        user: users[2],
        borrowedAt: moment().subtract(2, 'days').toDate(),
      },
      // 5 records for Obi-Wan Kenobi in more recent date order
      {
        book: books[0],
        user: users[1],
        borrowedAt: moment().subtract(20, 'days').toDate(),
        returnedAt: moment().subtract(19, 'days').toDate(),
        userScore: 7,
      },
      {
        book: books[1],
        user: users[1],
        borrowedAt: moment().subtract(18, 'days').toDate(),
        returnedAt: moment().subtract(17, 'days').toDate(),
        userScore: 8,
      },
      {
        book: books[2],
        user: users[1],
        borrowedAt: moment().subtract(16, 'days').toDate(),
        returnedAt: moment().subtract(15, 'days').toDate(),
        userScore: 6,
      },
      {
        book: books[3],
        user: users[1],
        borrowedAt: moment().subtract(14, 'days').toDate(),
        returnedAt: moment().subtract(13, 'days').toDate(),
        userScore: 9,
      },
      {
        book: books[4],
        user: users[1],
        borrowedAt: moment().subtract(12, 'days').toDate(),
      },
    ].map((userBook) => em.create(UserBook, userBook));
  }
}
