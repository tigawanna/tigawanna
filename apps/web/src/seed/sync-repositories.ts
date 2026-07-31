import { getPayload } from "payload";
import config from "@payload-config";

import { queueAndRunGithubMetadataSync } from "@/jobs/queue-and-run-metadata-sync";

/**
 * One-shot CLI: queue + run GitHub metadata sync (no enrichment).
 *
 *   pnpm sync:repositories
 */
async function main() {
  const payload = await getPayload({ config });
  const result = await queueAndRunGithubMetadataSync(payload);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

await main();
