import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  convertMarkdownToLexical,
  editorConfigFactory,
} from "@payloadcms/richtext-lexical";
import { getPayload } from "payload";

import { STATIC_ARTICLES, STATIC_LESSONS } from "../components/landing/data/static";
import payloadConfig from "../payload.config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

loadEnv({ path: path.resolve(dirname, "../../.env") });

/**
 * Normalizes GitHub-style callouts so Lexical markdown import stays readable.
 */
function normalizeMarkdown(markdown: string): string {
  return markdown
    .replace(/^\[!TIP\]\s*$/gm, "> **Tip**")
    .replace(/^\[!NOTE\]\s*$/gm, "> **Note**")
    .replace(/^\[!WARNING\]\s*$/gm, "> **Warning**")
    .replace(/^\[!IMPORTANT\]\s*$/gm, "> **Important**");
}

/**
 * Seeds static TIL fixtures + Dev.to article stubs into the Journals collection.
 *
 * Idempotent: existing slugs are updated in place.
 *
 * Run from `apps/next-landing`:
 *   pnpm seed:journals
 */
async function seedJournals() {
  const payload = await getPayload({ config: payloadConfig });
  const editorConfig = await editorConfigFactory.default({
    config: payload.config,
  });

  payload.logger.info(`Seeding ${STATIC_LESSONS.length} TIL journals…`);

  for (const lesson of STATIC_LESSONS) {
    const content = convertMarkdownToLexical({
      editorConfig,
      markdown: normalizeMarkdown(lesson.markdown),
    });

    const data = {
      title: lesson.title,
      kind: "til" as const,
      description: lesson.description,
      content,
      gist: lesson.gist ?? undefined,
      slug: lesson.id,
      generateSlug: false,
      publishedAt: lesson.created,
      _status: "published" as const,
    };

    const existing = await payload.find({
      collection: "journals",
      depth: 0,
      limit: 1,
      pagination: false,
      where: { slug: { equals: lesson.id } },
    });

    if (existing.docs[0]) {
      await payload.update({
        collection: "journals",
        id: existing.docs[0].id,
        data,
        context: { disableRevalidate: true, skipDevtoScaffold: true },
        draft: false,
        overrideAccess: true,
      });
      payload.logger.info(`  updated til: ${lesson.id}`);
    } else {
      await payload.create({
        collection: "journals",
        data,
        context: { disableRevalidate: true, skipDevtoScaffold: true },
        draft: false,
        overrideAccess: true,
      });
      payload.logger.info(`  created til: ${lesson.id}`);
    }
  }

  payload.logger.info(`Seeding ${STATIC_ARTICLES.length} blog posts from Dev.to stubs…`);

  for (const article of STATIC_ARTICLES) {
    const markdown = [
      article.description,
      "",
      `Originally published on [Dev.to](${article.url}).`,
      "",
      "Full body can be pasted into Lexical later — this seed keeps the card + canonical link.",
    ].join("\n");

    const content = convertMarkdownToLexical({
      editorConfig,
      markdown,
    });

    const data = {
      title: article.title,
      kind: "post" as const,
      description: article.description,
      content,
      slug: article.slug,
      generateSlug: false,
      tags: article.tag_list.map((tag) => ({ tag })),
      publishedAt: article.published_at || article.published_timestamp,
      _status: "published" as const,
      devto: {
        enabled: true,
        status: "published" as const,
        url: article.url,
        lastSyncedAt: article.published_at || article.published_timestamp,
      },
    };

    const existing = await payload.find({
      collection: "journals",
      depth: 0,
      limit: 1,
      pagination: false,
      where: { slug: { equals: article.slug } },
    });

    if (existing.docs[0]) {
      await payload.update({
        collection: "journals",
        id: existing.docs[0].id,
        data,
        context: { disableRevalidate: true, skipDevtoScaffold: true },
        draft: false,
        overrideAccess: true,
      });
      payload.logger.info(`  updated post: ${article.slug}`);
    } else {
      await payload.create({
        collection: "journals",
        data,
        context: { disableRevalidate: true, skipDevtoScaffold: true },
        draft: false,
        overrideAccess: true,
      });
      payload.logger.info(`  created post: ${article.slug}`);
    }
  }

  payload.logger.info("Journal seed complete.");
  await payload.destroy();
}

await seedJournals();
