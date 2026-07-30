import type { Payload, TypedUser } from "payload";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  collectArtifacts,
  createGitHubClient,
  type GithubRepoNode,
  type GithubRepoSnapshot,
  type MonorepoKind,
  type RepoPackageUnit,
} from "@repo/github";

import {
  inferRepositoryCategory,
  isRepositoryCategory,
  type RepositoryCategory,
} from "./repository-category";

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

type SpelunkFields = {
  defaultBranch: string;
  isMonorepo: boolean;
  monorepoKind: MonorepoKind | null;
  readmeMarkdown: string;
  packages: Array<{
    name: string;
    path: string;
    kind: RepoPackageUnit["kind"];
    description: string;
    readmePath: string;
    readmeMarkdown: string;
  }>;
};

/** Soft cap for Turso/libSQL row payloads — large READMEs were timing out inserts. */
const MAX_STORED_README_CHARS = 6_000;
const MAX_NESTED_README_CHARS = 4_000;
const DB_RETRY_ATTEMPTS = 4;
const DB_RETRY_BASE_MS = 750;

/**
 * Truncates README text for Payload storage (Turso-friendly payload size).
 *
 * @param markdown - Full README markdown.
 * @param maxChars - Maximum characters to keep.
 */
function truncateStoredReadme(markdown: string, maxChars = MAX_STORED_README_CHARS): string {
  const trimmed = markdown.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars).trimEnd()}\n\n…(truncated)`;
}

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
 * Resolves a GitHub PAT from env (`GH_PAT`).
 */
function requireGithubPat(): string {
  const pat = process.env.GH_PAT?.trim();
  if (!pat) {
    throw new Error("Set GH_PAT to sync repositories from GitHub.");
  }
  return pat;
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
 * Topic names from a GitHub repo node.
 */
function topicNames(repo: GithubRepoNode): string[] {
  return (repo.repositoryTopics?.nodes ?? [])
    .map((node) => node.topic?.name)
    .filter((tag): tag is string => Boolean(tag));
}

/**
 * Resolves category for upsert: keep an existing manual value, otherwise infer from topics.
 */
function resolveCategory(
  repo: GithubRepoNode,
  existingCategory: string | null | undefined,
): RepositoryCategory {
  if (isRepositoryCategory(existingCategory)) {
    return existingCategory;
  }
  return inferRepositoryCategory(topicNames(repo));
}

/**
 * Maps a GitHub repo node into a spelunk snapshot (needs default branch).
 */
function toRepoSnapshot(repo: GithubRepoNode): GithubRepoSnapshot {
  return {
    id: repo.nameWithOwner,
    name: repo.name,
    nameWithOwner: repo.nameWithOwner,
    description: repo.description ?? null,
    homepageUrl: repo.homepageUrl || null,
    openGraphImageUrl: repo.openGraphImageUrl || null,
    topics: topicNames(repo),
    defaultBranch: repo.defaultBranchRef?.name?.trim() || "main",
  };
}

/**
 * Maps spelunk package units into Payload array rows.
 * Root README lives on `readmeMarkdown` only — avoid duplicating huge blobs in the array.
 */
function toPackageRows(units: RepoPackageUnit[]) {
  return units.map((unit) => ({
    name: unit.name,
    path: unit.path,
    kind: unit.kind,
    description: (unit.description ?? "").slice(0, 500),
    readmePath: unit.readmePath ?? "",
    readmeMarkdown:
      unit.path === "." || unit.kind === "root"
        ? ""
        : truncateStoredReadme(unit.readme ?? "", MAX_NESTED_README_CHARS),
  }));
}

/**
 * Spelunks tree + nested READMEs for one repo (best-effort).
 */
async function spelunkRepositoryFields(
  client: ReturnType<typeof createGitHubClient>,
  repo: GithubRepoNode,
): Promise<SpelunkFields> {
  const snapshot = toRepoSnapshot(repo);
  const spelunk = await collectArtifacts(client, snapshot);

  return {
    defaultBranch: snapshot.defaultBranch,
    isMonorepo: spelunk.monorepo.isMonorepo,
    monorepoKind: spelunk.monorepo.kind,
    readmeMarkdown: truncateStoredReadme(spelunk.readme ?? ""),
    packages: toPackageRows(spelunk.packages),
  };
}

/**
 * Maps a GitHub repo node into Payload repository field data.
 */
function toRepositoryData(
  repo: GithubRepoNode,
  featured: boolean,
  syncedAt: string,
  category: RepositoryCategory,
  spelunk: SpelunkFields | null,
) {
  return {
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
    lastSyncedAt: syncedAt,
    ...(spelunk
      ? {
          defaultBranch: spelunk.defaultBranch,
          isMonorepo: spelunk.isMonorepo,
          monorepoKind: spelunk.monorepoKind,
          readmeMarkdown: spelunk.readmeMarkdown,
          packages: spelunk.packages,
        }
      : {}),
  };
}

/**
 * Pulls pinned + recent public repos from GitHub and upserts them into Payload.
 *
 * Featured = currently pinned on GitHub. Existing rows not in this pull keep
 * their data but lose featured if they were only featured via a previous pin.
 *
 * Category is inferred from topics only when the row has no category yet —
 * admin overrides are preserved across syncs.
 *
 * Spelunk (tree + package.json + nested READMEs) runs per repo so the detail
 * page can render from Payload without live GitHub fetches.
 */
export async function syncRepositoriesFromGithub(
  payload: Payload,
  options: SyncOpOptions = {},
): Promise<SyncRepositoriesResult> {
  const client = createGitHubClient(requireGithubPat());
  const recentLimit = options.recentLimit ?? 100;
  const access = {
    user: options.user ?? undefined,
    overrideAccess: !options.user,
  };

  const [pinned, recentResult] = await Promise.all([
    client.getPinnedRepos(),
    client.getRecentRepos({ first: recentLimit, isFork: false }),
  ]);

  const recent = recentResult.data?.viewer.repositories.nodes ?? [];
  const pinnedKeys = new Set(pinned.map((repo) => repo.nameWithOwner));

  // Prefer the richer recent node when a repo appears in both lists.
  const byKey = new Map<string, GithubRepoNode>();
  for (const repo of recent) {
    byKey.set(repo.nameWithOwner, repo);
  }
  for (const repo of pinned) {
    if (!byKey.has(repo.nameWithOwner)) {
      byKey.set(repo.nameWithOwner, repo);
    }
  }

  const syncedAt = new Date().toISOString();
  let created = 0;
  let updated = 0;
  let spelunkFailures = 0;

  for (const repo of byKey.values()) {
    try {
      const existing = await withDbRetry(`find ${repo.nameWithOwner}`, () =>
        payload.find({
          collection: "repositories",
          where: { nameWithOwner: { equals: repo.nameWithOwner } },
          limit: 1,
          depth: 0,
          ...access,
        }),
      );

      const row = existing.docs[0];
      const category = resolveCategory(repo, row?.category);

      let spelunk: SpelunkFields | null = null;
      if (!options.skipSpelunk) {
        try {
          spelunk = await spelunkRepositoryFields(client, repo);
        } catch (err: unknown) {
          spelunkFailures += 1;
          console.error(`[repositories] Spelunk failed for ${repo.nameWithOwner}`, err);
        }
      }

      const data = toRepositoryData(
        repo,
        pinnedKeys.has(repo.nameWithOwner),
        syncedAt,
        category,
        spelunk,
      );

      try {
        if (row) {
          await withDbRetry(`update ${repo.nameWithOwner}`, () =>
            payload.update({
              collection: "repositories",
              id: row.id,
              data,
              context: { disableRevalidate: true },
              ...access,
            }),
          );
          updated += 1;
        } else {
          await withDbRetry(`create ${repo.nameWithOwner}`, () =>
            payload.create({
              collection: "repositories",
              data: {
                ...data,
                isMonorepo: spelunk?.isMonorepo ?? false,
              },
              context: { disableRevalidate: true },
              ...access,
            }),
          );
          created += 1;
        }
      } catch (err: unknown) {
        // Large README / Turso timeouts — fall back to metadata-only so sync continues.
        console.error(
          `[repositories] Upsert with README failed for ${repo.nameWithOwner}; retrying metadata only`,
          err,
        );
        spelunkFailures += 1;

        const metadataOnly = toRepositoryData(
          repo,
          pinnedKeys.has(repo.nameWithOwner),
          syncedAt,
          category,
          null,
        );

        try {
          if (row) {
            await withDbRetry(`update-meta ${repo.nameWithOwner}`, () =>
              payload.update({
                collection: "repositories",
                id: row.id,
                data: metadataOnly,
                context: { disableRevalidate: true },
                ...access,
              }),
            );
            updated += 1;
          } else {
            await withDbRetry(`create-meta ${repo.nameWithOwner}`, () =>
              payload.create({
                collection: "repositories",
                data: { ...metadataOnly, isMonorepo: false },
                context: { disableRevalidate: true },
                ...access,
              }),
            );
            created += 1;
          }
        } catch (retryErr: unknown) {
          console.error(
            `[repositories] Metadata upsert failed for ${repo.nameWithOwner}`,
            retryErr,
          );
        }
      }
    } catch (err: unknown) {
      spelunkFailures += 1;
      console.error(`[repositories] Skipping ${repo.nameWithOwner} after DB failures`, err);
    }
  }

  // Clear featured on rows that are no longer GitHub-pinned.
  if (pinnedKeys.size > 0) {
    try {
      const previouslyFeatured = await withDbRetry("find previously featured", () =>
        payload.find({
          collection: "repositories",
          where: {
            and: [{ featured: { equals: true } }, { nameWithOwner: { not_in: [...pinnedKeys] } }],
          },
          limit: 100,
          depth: 0,
          ...access,
        }),
      );

      for (const row of previouslyFeatured.docs) {
        try {
          await withDbRetry(`unfeature ${row.nameWithOwner}`, () =>
            payload.update({
              collection: "repositories",
              id: row.id,
              data: { featured: false },
              context: { disableRevalidate: true },
              ...access,
            }),
          );
          updated += 1;
        } catch (err: unknown) {
          console.error(`[repositories] Failed to unfeature ${row.nameWithOwner}`, err);
        }
      }
    } catch (err: unknown) {
      console.error("[repositories] Failed to clear stale featured flags", err);
    }
  }

  bustRepositoryCaches();

  return {
    created,
    updated,
    featured: pinnedKeys.size,
    total: byKey.size,
    pulledAt: syncedAt,
    spelunkFailures,
  };
}
