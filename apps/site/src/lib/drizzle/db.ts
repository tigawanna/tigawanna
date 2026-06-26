import * as schema from "@/lib/drizzle/schema";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

export const DEFAULT_DATABASE_URL = "file:./local.db";

export function createDb(url: string, authToken?: string) {
  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
}

export type AppDatabase = ReturnType<typeof createDb>;
