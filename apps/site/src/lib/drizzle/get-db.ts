import { createDb } from "@/lib/drizzle/db";
import { getWorkerEnv } from "@/lib/worker-env";

export function getDb() {
  return createDb(getWorkerEnv().DB);
}
