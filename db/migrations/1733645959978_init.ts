import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("session")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("slug", "varchar", (col) => col.unique().notNull())
    .addColumn("name", "varchar")
    .addColumn("pin", "varchar")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("updated_at", "timestamp", (col) => col.defaultTo("now()"))
    .execute();

  await db.schema
    .createTable("session_user")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("session_id", "integer", (col) =>
      col.references("session.id").onDelete("cascade").notNull()
    )
    .addColumn("username", "varchar", (col) => col.unique().notNull())
    .addColumn("is_owner", "boolean")
    .addColumn("created_at", "timestamp", (col) => col.defaultTo("now()"))
    .addColumn("updated_at", "timestamp", (col) => col.defaultTo("now()"))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("session_user").execute();
  await db.schema.dropTable("session").execute();
}
