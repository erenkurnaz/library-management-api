import { Migration } from '@mikro-orm/migrations';

export class Migration20241026120048 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "user_book" ("id" uuid not null default gen_random_uuid(), "book_id" uuid not null, "user_id" uuid not null, "created_at" timestamptz not null default 'now()', "updated_at" timestamptz null, "returned_at" timestamptz null, "borrowed_at" timestamptz null, "user_score" int null, constraint "user_book_pkey" primary key ("id", "book_id", "user_id"));`,
    );

    this.addSql(
      `alter table "user_book" add constraint "user_book_book_id_foreign" foreign key ("book_id") references "book" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "user_book" add constraint "user_book_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`,
    );
  }
}
