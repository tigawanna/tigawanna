import type { Payload } from "payload";
import { revalidatePath, revalidateTag } from "next/cache";
import { extractRepoTags, type GithubRepoNode } from "@repo/github";
import type { TaskConfig } from "payload";

import { listGithubRepos, requireGithubPat } from "@/modules/github/list-github-repos";
import { resolveRepositoryCategory } from "@/modules/github/repository-category";

/** Only upsert repos whose GitHub `pushedAt` is within this window (no DB touch otherwise). */
const RECENT_PUSH_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

/**
 * Busts Next.js cache tags for landing project cards (no-op outside a Next request).
 */
function bustRepositoryCaches() {
  try {
    revalidateTag("landing-pinned-repos", "max");
    revalidateTag("landing-recent-repos", "max");
    revalidateTag("landing-github-live-repos", "max");
    revalidatePath("/");
  } catch {
    // Outside of a Next.js request (e.g. payload run) — ignore.
  }
}

/**
 * Whether GitHub reports activity within the recent-push window.
 *
 * @param pushedAt - ISO timestamp from GraphQL.
 */
function wasPushedRecently(pushedAt: string): boolean {
  const pushedMs = Date.parse(pushedAt);
  if (Number.isNaN(pushedMs)) return true;
  return Date.now() - pushedMs <= RECENT_PUSH_WINDOW_MS;
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
 * Lists GitHub repos and upserts Payload metadata for recently pushed / pinned repos only.
 * Skips DB reads/writes when `pushedAt` is older than two days (unless featured/pinned).
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
    { name: "skipped", type: "number", required: true },
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
    let skipped = 0;

    for (const { node: repo, featured } of repos) {
      // Pinned repos always sync so featured flags stay correct; others only if recently pushed.
      if (!featured && !wasPushedRecently(repo.pushedAt)) {
        skipped += 1;
        continue;
      }

      try {
        const { created: wasCreated } = await upsertRepoMetadataRow(
          payload,
          repo,
          featured,
          pulledAt,
        );
        if (wasCreated) created += 1;
        else updated += 1;
      } catch (err: unknown) {
        console.error(`[repositories] Metadata upsert failed for ${repo.nameWithOwner}`, err);
      }
    }

    await clearStaleFeaturedFlags(payload, pinnedKeys);
    bustRepositoryCaches();

    console.log("[listAndUpsertRepos] done", {
      created,
      updated,
      skipped,
      featured: pinnedKeys.length,
    });

    return {
      output: {
        upserted: created + updated,
        created,
        updated,
        skipped,
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
    skipped: number;
    featured: number;
    pulledAt: string;
  };
}>;
