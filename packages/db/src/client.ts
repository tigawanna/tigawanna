import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema/index.js";

export const DEFAULT_DATABASE_URL = "file:./local.db";

export function createDb(url: string, authToken?: string) {
  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
}

export type AppDatabase = ReturnType<typeof createDb>;
