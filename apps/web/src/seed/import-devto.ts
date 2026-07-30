import { getPayload, type Payload } from "payload";

import {
  importPostsFromDevto,
  type ImportFromDevtoResult,
} from "@/modules/devto/import-from-devto";
import payloadConfig from "../payload.config";

export type { ImportFromDevtoResult as ImportDevtoResult };

/**
 * CLI / seed wrapper — prefer the Blogs list “Import from Dev.to” button in admin.
 *
 *   pnpm import:devto
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

const isDirectRun = process.argv[1]?.includes("import-devto");
if (isDirectRun) {
  await importDevtoPosts();
}
