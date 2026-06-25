import { drizzle } from "drizzle-orm/libsql/node";
import * as schema from "./schema";

export function createDb(connection: { url: string; authToken: string }) {
  return drizzle({
    connection,
    schema,
  });
}

export type AppDatabase = ReturnType<typeof createDb>;
