import { createDb } from "./create-db";
import { serverEnv } from "@/lib/server-env";

export const db = createDb({
  url: serverEnv.DATABASE_URL,
  authToken: serverEnv.DATABASE_AUTH_TOKEN,
});

export * from "./schema";
