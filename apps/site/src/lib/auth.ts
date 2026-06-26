import { createAuth } from "@/server/create-auth";
import { getWorkerEnv } from "@/lib/worker-env";

export function getAuth() {
  return createAuth(getWorkerEnv());
}
