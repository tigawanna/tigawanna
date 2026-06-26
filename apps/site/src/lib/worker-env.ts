import { AsyncLocalStorage } from "node:async_hooks";
import { env as cloudflareEnv } from "cloudflare:workers";

const workerEnvStore = new AsyncLocalStorage<CloudflareBindings>();

export function runWithWorkerEnv<T>(env: CloudflareBindings, fn: () => T): T {
  return workerEnvStore.run(env, fn);
}

export function getWorkerEnv(): CloudflareBindings {
  const stored = workerEnvStore.getStore();
  if (stored) {
    return stored;
  }

  return cloudflareEnv as CloudflareBindings;
}
