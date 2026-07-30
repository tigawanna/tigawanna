import { getPayload } from "payload";
import config from "@payload-config";

import { syncRepositoriesFromGithub } from "@/modules/github/sync-repositories-from-github";

/**
 * One-shot CLI sync: pull pinned + recent GitHub repos into Payload.
 *
 *   pnpm --filter web exec payload run ./src/seed/sync-repositories.ts
 */
async function main() {
  const payload = await getPayload({ config });
  const result = await syncRepositoriesFromGithub(payload);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

await main();
