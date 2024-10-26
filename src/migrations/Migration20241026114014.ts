import { Migration } from '@mikro-orm/migrations';

export class Migration20241026114014 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create type "user_role" as enum ('user', 'admin');`);
    this.addSql(
      `create table "user" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default 'now()', "updated_at" timestamptz null, "email" varchar(255) not null, "password" varchar(255) not null, "full_name" varchar(255) not null, "role" "user_role" not null default 'user', constraint "user_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "user" add constraint "user_email_unique" unique ("email");`,
    );
  }
}
