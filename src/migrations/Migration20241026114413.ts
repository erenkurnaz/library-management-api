import { Migration } from '@mikro-orm/migrations';

export class Migration20241026114413 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "book" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default 'now()', "updated_at" timestamptz null, "name" varchar(255) not null, constraint "book_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "book" add constraint "book_name_unique" unique ("name");`,
    );
  }
}
