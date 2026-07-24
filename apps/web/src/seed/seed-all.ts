import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import { STATIC_LESSONS } from "../components/landing/data/static";
import payloadConfig from "../payload.config";
import { importDevtoPosts } from "./import-devto";
import { seedJournals } from "./seed-journals";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

loadEnv({ path: path.resolve(dirname, "../../.env") });

/**
 * Full CMS seed:
 * 1. Old journal / TIL fixtures → `kind: journal`
 * 2. All public Dev.to articles → `kind: post` (full markdown bodies)
 *
 * Verifies published counts match expectations, then exits non-zero on mismatch.
 *
 * Run from `apps/web` (prefer stopping the Next/Payload server first):
 *   pnpm seed:all
 */
async function seedAll() {
  const payload = await getPayload({ config: payloadConfig });

  try {
    const journals = await seedJournals(payload);
    const posts = await importDevtoPosts(payload);

    const publishedJournals = await payload.find({
      collection: "blogs",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ kind: { equals: "journal" } }, { _status: { equals: "published" } }],
      },
    });

    const publishedPosts = await payload.find({
      collection: "blogs",
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ kind: { equals: "post" } }, { _status: { equals: "published" } }],
      },
    });

    const journalCount = publishedJournals.totalDocs;
    const postCount = publishedPosts.totalDocs;
    const expectedJournals = STATIC_LESSONS.length;
    const expectedPosts = posts.expected;

    payload.logger.info("——— seed:all summary ———");
    payload.logger.info(
      `journals: cms=${journalCount} expected=${expectedJournals} (created=${journals.created} updated=${journals.updated})`,
    );
    payload.logger.info(
      `posts:    cms=${postCount} expected=${expectedPosts} (created=${posts.created} updated=${posts.updated} failed=${posts.failed})`,
    );
    payload.logger.info(`total published blogs: ${journalCount + postCount}`);

    const journalsOk = journalCount >= expectedJournals;
    const postsOk = postCount >= expectedPosts && posts.failed === 0;

    if (!journalsOk || !postsOk) {
      throw new Error(
        [
          "Seed verification failed.",
          `journals ${journalCount}/${expectedJournals}`,
          `posts ${postCount}/${expectedPosts}`,
          `failed imports ${posts.failed}`,
        ].join(" "),
      );
    }

    payload.logger.info("All items seeded successfully.");
  } finally {
    await payload.destroy();
  }
}

await seedAll();
