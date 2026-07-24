import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { editorConfigFactory } from "@payloadcms/richtext-lexical";
import { getPayload, type Payload } from "payload";

import { STATIC_LESSONS } from "../components/landing/data/static";
import { markdownToLexicalWithCodeBlocks } from "../lib/markdown-to-lexical";
import payloadConfig from "../payload.config";
import { upsertBlogBySlug } from "./upsert-blog";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

loadEnv({ path: path.resolve(dirname, "../../.env") });

export type SeedJournalsResult = {
  expected: number;
  created: number;
  updated: number;
};

/**
 * Seeds static journal fixtures (old TILs) into the Blogs collection as `kind: journal`.
 *
 * Idempotent by slug. Does not touch Dev.to posts.
 */
export async function seedJournals(payload?: Payload): Promise<SeedJournalsResult> {
  const ownsPayload = !payload;
  const client = payload ?? (await getPayload({ config: payloadConfig }));
  const editorConfig = await editorConfigFactory.default({
    config: client.config,
  });

  client.logger.info(`Seeding ${STATIC_LESSONS.length} journals from static fixtures…`);

  let created = 0;
  let updated = 0;

  for (const lesson of STATIC_LESSONS) {
    const content = markdownToLexicalWithCodeBlocks(lesson.markdown, editorConfig);
    const result = await upsertBlogBySlug(client, {
      title: lesson.title,
      kind: "journal",
      description: lesson.description,
      content,
      gist: lesson.gist ?? undefined,
      slug: lesson.id,
      publishedAt: lesson.created,
      _status: "published",
    });

    if (result === "created") created += 1;
    else updated += 1;
    client.logger.info(`  ${result} journal: ${lesson.id}`);
  }

  client.logger.info(
    `Journal seed complete. expected=${STATIC_LESSONS.length} created=${created} updated=${updated}`,
  );

  if (ownsPayload) await client.destroy();

  return { expected: STATIC_LESSONS.length, created, updated };
}

const isDirectRun = process.argv[1]?.includes("seed-journals");
if (isDirectRun) {
  await seedJournals();
}
