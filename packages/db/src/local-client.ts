import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql/node";

import * as schema from "./schema/index.js";

export function createLocalDb(url: string, authToken?: string) {
  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
}
