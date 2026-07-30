import type { Payload, TypedUser } from "payload";
import { revalidatePath, revalidateTag } from "next/cache";
import { createGitHubClient } from "@repo/github";

import { listGithubRepos, requireGithubPat } from "./list-github-repos";
import {
  mapEnrichmentFields,
  shouldEnrichRepo,
  writeRepoEnrichment,
} from "./map-enrichment-fields";
import { clearStaleFeaturedFlags, resolveCategory, topicNames } from "./upsert-repo-metadata";

export type SyncRepositoriesResult = {
  created: number;
  updated: number;
  featured: number;
  total: number;
  pulledAt: string;
  spelunkFailures: number;
};

type SyncOpOptions = {
  user?: TypedUser | null;
  /** How many recent public repos to pull (default 100). */
  recentLimit?: number;
  /** Skip tree/README spelunk (metadata-only sync). */
  skipSpelunk?: boolean;
};

const DB_RETRY_ATTEMPTS = 4;
const DB_RETRY_BASE_MS = 750;

/**
 * True when an error looks like a transient Turso / network failure.
 *
 * @param err - Unknown caught error.
 */
function isTransientDbError(err: unknown): boolean {
  const parts: string[] = [];
  let current: unknown = err;
  for (let i = 0; i < 6 && current; i += 1) {
    if (current instanceof Error) {
      parts.push(current.message, current.name);
      current = "cause" in current ? current.cause : undefined;
      continue;
    }
    if (typeof current === "object" && current !== null && "code" in current) {
      parts.push(String((current as { code?: unknown }).code));
    }
    break;
  }
  const blob = parts.join(" ").toLowerCase();
  return (
    blob.includes("etimedout") ||
    blob.includes("timeout") ||
    blob.includes("fetch failed") ||
    blob.includes("econnreset") ||
    blob.includes("enotfound") ||
    blob.includes("socket hang up") ||
    blob.includes("und_err_connect_timeout") ||
    blob.includes("connect timeout")
  );
}

/**
 * Retries a DB operation on transient Turso/network errors.
 * Temporary — removed when callers move to Payload Jobs (plan step 6).
 *
 * @param label - Log label for diagnostics.
 * @param run - Async operation to run.
 */
async function withDbRetry<T>(label: string, run: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= DB_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await run();
    } catch (err: unknown) {
      lastError = err;
      if (!isTransientDbError(err) || attempt === DB_RETRY_ATTEMPTS) {
        throw err;
      }
      const delay = DB_RETRY_BASE_MS * 2 ** (attempt - 1);
      console.warn(
        `[repositories] Transient DB error on ${label} (attempt ${attempt}/${DB_RETRY_ATTEMPTS}); retrying in ${delay}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

/**
 * Busts Next.js cache tags for landing project cards and detail routes.
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
 * Pulls pinned + recent public repos from GitHub and upserts them into Payload.
 *
 * Legacy monolithic entry used by cron / admin / seed until Payload Jobs cutover.
 * Domain work lives in list / upsert / enrich helpers.
 */
export async function syncRepositoriesFromGithub(
  payload: Payload,
  options: SyncOpOptions = {},
): Promise<SyncRepositoriesResult> {
  const client = createGitHubClient(requireGithubPat());
  const access = { user: options.user ?? null };
  const flags = {
    user: access.user ?? undefined,
    overrideAccess: !access.user,
  };

  const { repos, pinnedKeys, pulledAt } = await listGithubRepos({
    recentLimit: options.recentLimit,
  });

  let created = 0;
  let updated = 0;
  let spelunkFailures = 0;

  for (const { node: repo, featured } of repos) {
    try {
      const row = await withDbRetry(`find ${repo.nameWithOwner}`, async () => {
        const existing = await payload.find({
          collection: "repositories",
          where: { nameWithOwner: { equals: repo.nameWithOwner } },
          limit: 1,
          depth: 0,
          ...flags,
        });
        return existing.docs[0] ?? null;
      });
      const category = resolveCategory(repo, row?.category);
      const data = {
        name: repo.name,
        nameWithOwner: repo.nameWithOwner,
        url: repo.url,
        homepageUrl: repo.homepageUrl || "",
        openGraphImageUrl: repo.openGraphImageUrl || "",
        description: repo.description || "",
        descriptionHTML: repo.descriptionHTML || "",
        topics: topicNames(repo).map((tag) => ({ tag })),
        category,
        featured,
        pushedAt: repo.pushedAt,
        isPrivate: Boolean(repo.isPrivate),
        isFork: Boolean(repo.isFork),
        isArchived: Boolean(repo.isArchived),
        stargazerCount: repo.stargazerCount ?? 0,
        forkCount: repo.forkCount ?? 0,
        lastSyncedAt: pulledAt,
      };

      const doc = await withDbRetry(`upsert-meta ${repo.nameWithOwner}`, async () => {
        if (row) {
          return payload.update({
            collection: "repositories",
            id: row.id,
            data,
            context: { disableRevalidate: true },
            ...flags,
          });
        }
        return payload.create({
          collection: "repositories",
          data: { ...data, isMonorepo: false },
          context: { disableRevalidate: true },
          ...flags,
        });
      });

      if (row) updated += 1;
      else created += 1;

      if (options.skipSpelunk) continue;

      if (
        !shouldEnrichRepo(
          {
            lastEnrichedAt: doc.lastEnrichedAt,
            pushedAt: doc.pushedAt,
          },
          { pushedAt: repo.pushedAt },
        )
      ) {
        continue;
      }

      try {
        const fields = await mapEnrichmentFields(client, repo);
        await withDbRetry(`enrich ${repo.nameWithOwner}`, () =>
          writeRepoEnrichment({
            payload,
            docId: doc.id,
            fields,
            enrichedAt: pulledAt,
            access,
          }),
        );
      } catch (err: unknown) {
        spelunkFailures += 1;
        console.error(`[repositories] Enrichment failed for ${repo.nameWithOwner}`, err);
      }
    } catch (err: unknown) {
      spelunkFailures += 1;
      console.error(`[repositories] Skipping ${repo.nameWithOwner} after failures`, err);
    }
  }

  try {
    const cleared = await withDbRetry("clear stale featured", () =>
      clearStaleFeaturedFlags(payload, pinnedKeys, access),
    );
    updated += cleared;
  } catch (err: unknown) {
    console.error("[repositories] Failed to clear stale featured flags", err);
  }

  bustRepositoryCaches();

  return {
    created,
    updated,
    featured: pinnedKeys.length,
    total: repos.length,
    pulledAt,
    spelunkFailures,
  };
}
