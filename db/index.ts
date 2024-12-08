import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "kysely-codegen";
import { envs } from "../envs";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: envs.DATABASE_URL,
  }),
});

export const db = new Kysely<DB>({
  dialect,
});
