import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("room")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("slug", "varchar", (col) => col.unique().notNull())
    .addColumn("name", "varchar")
    .addColumn("pin", "varchar")
    .addColumn("started_at", "timestamp")
    .addColumn("finished_at", "timestamp")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .execute();

  await db.schema
    .createTable("room_user")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("room_id", "integer", (col) =>
      col.references("room.id").onDelete("cascade").notNull()
    )
    .addColumn("username", "varchar", (col) => col.unique().notNull())
    .addColumn("is_owner", "boolean")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .execute();

  await db.schema
    .createTable("question")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("room_id", "integer", (col) =>
      col.references("room.id").onDelete("cascade").notNull()
    )
    .addColumn("round", "integer", (col) => col.notNull())
    .addColumn("question", "text", (col) => col.notNull())
    .addColumn("options", "jsonb", (col) => col.notNull())
    .addColumn("correct_option", "varchar", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .execute();

  await db.schema
    .createTable("question_response")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("question_id", "integer", (col) =>
      col.references("question.id").onDelete("cascade").notNull()
    )
    .addColumn("room_user_id", "integer", (col) =>
      col.references("room_user.id").onDelete("cascade").notNull()
    )
    .addColumn("choice", "varchar", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("question_response").execute();
  await db.schema.dropTable("question").execute();
  await db.schema.dropTable("room_user").execute();
  await db.schema.dropTable("room").execute();
}
