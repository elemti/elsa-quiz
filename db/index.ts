import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { envs } from "../envs";
import { DB } from "./db";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: envs.DATABASE_URL,
  }),
});

export const db = new Kysely<DB>({
  dialect,
});
