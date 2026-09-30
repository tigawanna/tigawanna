import { getPayload, type Payload } from "payload";

import {
  importPostsFromDevto,
  type ImportFromDevtoResult,
} from "@/modules/devto/import-from-devto";
import payloadConfig from "../payload.config";

export type { ImportFromDevtoResult as ImportDevtoResult };

/**
 * CLI / seed wrapper — prefer the Blogs list “Import from Dev.to” button in admin.
 * See SCRIPTS.md for the one-off `payload run` command.
 */
export async function importDevtoPosts(payload?: Payload): Promise<ImportFromDevtoResult> {
  const ownsPayload = !payload;
  const client = payload ?? (await getPayload({ config: payloadConfig }));

  try {
    return await importPostsFromDevto(client);
  } finally {
    if (ownsPayload) await client.destroy();
  }
}

// `payload run <file>` puts the script path after the CLI entry, not at argv[1].
const isDirectRun = process.argv.slice(1).some((arg) => arg.includes("import-devto"));
if (isDirectRun) {
  await importDevtoPosts();
}
