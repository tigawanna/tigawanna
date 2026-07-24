import { config as loadEnv } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";

import payloadConfig from "../payload.config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

loadEnv({ path: path.resolve(dirname, "../../.env") });

type DevtoListArticle = {
  slug: string;
  cover_image: string | null;
  social_image?: string | null;
};

/**
 * Backfills `coverUrl` on existing posts from the public Dev.to list API.
 */
async function listCovers(username: string): Promise<DevtoListArticle[]> {
  const out: DevtoListArticle[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://dev.to/api/articles?username=${encodeURIComponent(username)}&page=${page}&per_page=30`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "tigawanna-cover-backfill",
        },
      },
    );
    if (!res.ok) throw new Error(`Dev.to list failed: ${res.status}`);
    const batch = (await res.json()) as DevtoListArticle[];
    if (!batch.length) break;
    out.push(...batch);
    page += 1;
  }
  return out;
}

async function main() {
  const payload = await getPayload({ config: payloadConfig });
  const username = process.env.DEVTO_USERNAME || "tigawanna";
  const articles = await listCovers(username);
  let updated = 0;

  for (const article of articles) {
    const cover = article.cover_image || article.social_image;
    if (!cover) continue;

    const found = await payload.find({
      collection: "blogs",
      depth: 0,
      limit: 1,
      pagination: false,
      where: { slug: { equals: article.slug } },
    });
    const doc = found.docs[0];
    if (!doc || doc.coverUrl === cover) continue;

    await payload.update({
      collection: "blogs",
      id: doc.id,
      data: { coverUrl: cover },
      context: { skipDevtoScaffold: true },
      overrideAccess: true,
    });
    updated += 1;
  }

  console.log(`cover backfill updated=${updated} listed=${articles.length}`);
  payload.logger.info(`cover backfill updated=${updated} listed=${articles.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
