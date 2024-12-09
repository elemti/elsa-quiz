import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const envs = createEnv({
  emptyStringAsUndefined: true,
  server: {
    DATABASE_URL: z.string().url(),
    SESSION_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_KEY: z.string(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_KEY: process.env.NEXT_PUBLIC_SUPABASE_KEY,
  },
});
