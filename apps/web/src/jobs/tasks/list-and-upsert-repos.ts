import type { Payload } from "payload";
import { revalidatePath, revalidateTag } from "next/cache";
import { extractRepoTags, type GithubRepoNode } from "@repo/github";
import type { TaskConfig } from "payload";

import { listGithubRepos, requireGithubPat } from "@/modules/github/list-github-repos";
import { shouldEnrichRepo } from "@/modules/github/map-enrichment-fields";
import { resolveRepositoryCategory } from "@/modules/github/repository-category";
import { ENRICH_STAGGER_MS, GITHUB_ENRICH_QUEUE } from "@/jobs/queues";

/**
 * Busts Next.js cache tags for landing project cards (no-op outside a Next request).
 */
function bustRepositoryCaches() {
  try {
    revalidateTag("landing-pinned-repos", "max");
    revalidateTag("landing-recent-repos", "max");
    revalidatePath("/");
  } catch {
    // Outside of a Next.js request (e.g. payload run) — ignore.
  }
}

/**
 * Clears `featured` on rows that are no longer GitHub-pinned.
 *
 * @param payload - Payload instance.
 * @param pinnedKeys - Current pin set (`nameWithOwner`).
 */
async function clearStaleFeaturedFlags(payload: Payload, pinnedKeys: string[]): Promise<number> {
  if (pinnedKeys.length === 0) return 0;

  const previouslyFeatured = await payload.find({
    collection: "repositories",
    where: {
      and: [{ featured: { equals: true } }, { nameWithOwner: { not_in: pinnedKeys } }],
    },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  });

  let updated = 0;
  for (const row of previouslyFeatured.docs) {
    try {
      await payload.update({
        collection: "repositories",
        id: row.id,
        data: { featured: false },
        context: { disableRevalidate: true },
        overrideAccess: true,
      });
      updated += 1;
    } catch (err: unknown) {
      console.error(`[repositories] Failed to unfeature ${row.nameWithOwner}`, err);
    }
  }
  return updated;
}

/**
 * Upserts one repo's metadata fields (no README / monorepo enrichment).
 *
 * @param payload - Payload instance.
 * @param repo - GitHub node.
 * @param featured - Whether currently pinned.
 * @param syncedAt - ISO timestamp for `lastSyncedAt`.
 */
async function upsertRepoMetadataRow(
  payload: Payload,
  repo: GithubRepoNode,
  featured: boolean,
  syncedAt: string,
) {
  const existing = await payload.find({
    collection: "repositories",
    where: { nameWithOwner: { equals: repo.nameWithOwner } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const row = existing.docs[0] ?? null;
  const topics = extractRepoTags(repo);
  const category = resolveRepositoryCategory(row?.category, topics);
  const data = {
    name: repo.name,
    nameWithOwner: repo.nameWithOwner,
    url: repo.url,
    homepageUrl: repo.homepageUrl || "",
    openGraphImageUrl: repo.openGraphImageUrl || "",
    description: repo.description || "",
    descriptionHTML: repo.descriptionHTML || "",
    topics: topics.map((tag) => ({ tag })),
    category,
    featured,
    pushedAt: repo.pushedAt,
    isPrivate: Boolean(repo.isPrivate),
    isFork: Boolean(repo.isFork),
    isArchived: Boolean(repo.isArchived),
    stargazerCount: repo.stargazerCount ?? 0,
    forkCount: repo.forkCount ?? 0,
    lastSyncedAt: syncedAt,
  };

  const doc = row
    ? await payload.update({
        collection: "repositories",
        id: row.id,
        data,
        context: { disableRevalidate: true },
        overrideAccess: true,
      })
    : await payload.create({
        collection: "repositories",
        data: { ...data, isMonorepo: false },
        context: { disableRevalidate: true },
        overrideAccess: true,
      });

  return { doc, created: !row };
}

/**
 * Lists GitHub repos, upserts Payload metadata, enqueues staggered `enrichRepo` jobs.
 * Does not fetch READMEs inline — enrichment is a separate queue.
 */
export const listAndUpsertReposTask = {
  slug: "listAndUpsertRepos",
  label: "List and upsert GitHub repos",
  retries: 2,
  inputSchema: [
    {
      name: "recentLimit",
      type: "number",
      admin: {
        description: "How many recent public repos to pull (default 100).",
      },
    },
  ],
  outputSchema: [
    { name: "upserted", type: "number", required: true },
    { name: "created", type: "number", required: true },
    { name: "updated", type: "number", required: true },
    { name: "queuedEnrich", type: "number", required: true },
    { name: "featured", type: "number", required: true },
    { name: "pulledAt", type: "text", required: true },
  ],
  handler: async ({ input, req }) => {
    requireGithubPat();
    const recentLimit =
      typeof input.recentLimit === "number" && input.recentLimit > 0 ? input.recentLimit : 100;

    const { repos, pinnedKeys, pulledAt } = await listGithubRepos({ recentLimit });
    const payload = req.payload;

    let created = 0;
    let updated = 0;
    const toEnrich: string[] = [];

    for (const { node: repo, featured } of repos) {
      try {
        const { doc, created: wasCreated } = await upsertRepoMetadataRow(
          payload,
          repo,
          featured,
          pulledAt,
        );
        if (wasCreated) created += 1;
        else updated += 1;

        if (shouldEnrichRepo({ lastEnrichedAt: doc.lastEnrichedAt }, { pushedAt: repo.pushedAt })) {
          toEnrich.push(repo.nameWithOwner);
        }
      } catch (err: unknown) {
        console.error(`[repositories] Metadata upsert failed for ${repo.nameWithOwner}`, err);
      }
    }

    await clearStaleFeaturedFlags(payload, pinnedKeys);

    const now = Date.now();
    for (let i = 0; i < toEnrich.length; i += 1) {
      const nameWithOwner = toEnrich[i];
      if (!nameWithOwner) continue;

      await payload.jobs.queue({
        workflow: "enrichRepo",
        queue: GITHUB_ENRICH_QUEUE,
        input: { nameWithOwner },
        waitUntil: new Date(now + i * ENRICH_STAGGER_MS),
      });
    }

    bustRepositoryCaches();

    return {
      output: {
        upserted: created + updated,
        created,
        updated,
        queuedEnrich: toEnrich.length,
        featured: pinnedKeys.length,
        pulledAt,
      },
    };
  },
} as const satisfies TaskConfig<{
  input: { recentLimit?: number };
  output: {
    upserted: number;
    created: number;
    updated: number;
    queuedEnrich: number;
    featured: number;
    pulledAt: string;
  };
}>;
