import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import {
  createGitHubClient,
  RequestError,
  type GithubRepoNode as GithubRepoNodeSource,
} from "@repo/github";

import { STATIC_PINNED_PROJECTS, STATIC_RECENT_PROJECTS } from "@/components/landing/data/static";
import type { GithubRepoNode } from "@/components/landing/types/github";
import { listGithubRepos } from "@/modules/github/list-github-repos";
import { resolveRepositoryCategory } from "@/modules/github/repository-category";
import { loadPayloadLandingReposCached } from "@/data-access/repositories";

export type GithubLandingRepos = {
  pinnedRepos: GithubRepoNode[];
  recentRepos: GithubRepoNode[];
};

const LOG_PREFIX = "[github-landing-repos]";

/** ~15m server cache for live GitHub GraphQL (`expire` must be > `revalidate`). */
const GITHUB_LIVE_CACHE_LIFE = {
  stale: 5 * 60,
  revalidate: 15 * 60,
  expire: 20 * 60,
} as const;

/**
 * Compact error text for logs (avoids dumping full GraphQL request payloads).
 *
 * @param err - Unknown catch value.
 */
function shortErr(err: unknown): string {
  if (err instanceof RequestError) {
    return `RequestError status=${err.status} ${err.message}`;
  }
  if (err instanceof Error) {
    const name = err.name !== "Error" ? `${err.name}: ` : "";
    return `${name}${err.message}`;
  }
  return String(err);
}

/**
 * True while `next build` is prerendering pages.
 * Live GitHub is skipped so flaky outbound TLS cannot fail the build.
 */
function isNextProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/**
 * Whether an error looks like a missing / rejected GitHub PAT.
 *
 * @param err - Unknown catch value.
 */
function isGithubAuthError(err: unknown): boolean {
  if (err instanceof RequestError) {
    return err.status === 401 || err.status === 403;
  }
  if (!(err instanceof Error)) return false;
  const message = err.message.toLowerCase();
  return (
    message.includes("bad credentials") ||
    message.includes("requires authentication") ||
    message.includes("unauthorized") ||
    message.includes("401")
  );
}

/**
 * Whether an error looks like a missing GitHub repo (deleted / renamed / private).
 *
 * @param err - Unknown catch value.
 */
function isGithubNotFoundError(err: unknown): boolean {
  if (err instanceof RequestError && err.status === 404) return true;
  if (!(err instanceof Error)) return false;
  const message = err.message.toLowerCase();
  return (
    message.includes("could not resolve to a repository") ||
    message.includes("not found") ||
    message.includes("404")
  );
}

/**
 * Whether an error looks like a network / connect timeout to GitHub.
 *
 * @param err - Unknown catch value.
 */
function isGithubNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const message = err.message.toLowerCase();
  const cause = "cause" in err && err.cause instanceof Error ? err.cause.message.toLowerCase() : "";
  const haystack = `${message} ${cause}`;
  return (
    haystack.includes("fetch failed") ||
    haystack.includes("connect timeout") ||
    haystack.includes("timeout") ||
    haystack.includes("econnreset") ||
    haystack.includes("enotfound") ||
    haystack.includes("network")
  );
}

/**
 * Logs token problems loudly for Vercel / runtime audits.
 *
 * @param context - Short label (`list` / `detail:owner/repo`).
 * @param err - Optional underlying error (invalid token); omit when missing.
 */
function logGithubTokenProblem(context: string, err?: unknown) {
  if (!err) {
    console.error(`${LOG_PREFIX} GH_PAT is missing (${context})`);
    return;
  }
  if (isGithubAuthError(err)) {
    console.error(`${LOG_PREFIX} GH_PAT is invalid or unauthorized (${context})`, shortErr(err));
  }
}

/**
 * Classifies a live-GitHub failure for audit logs.
 *
 * @param context - Short label.
 * @param err - Failure reason.
 */
function warnGithubFetchFailure(context: string, err: unknown) {
  if (isGithubAuthError(err)) {
    logGithubTokenProblem(context, err);
    return;
  }
  if (isGithubNotFoundError(err)) {
    console.warn(`${LOG_PREFIX} ${context} · repo not found on GitHub · ${shortErr(err)}`);
    return;
  }
  if (isGithubNetworkError(err)) {
    console.warn(`${LOG_PREFIX} ${context} · network/timeout talking to GitHub · ${shortErr(err)}`);
    return;
  }
  console.warn(`${LOG_PREFIX} ${context} · ${shortErr(err)}`);
}

/**
 * Maps a GraphQL repo node into the landing card shape, inferring category from topics.
 */
function toLandingRepo(node: GithubRepoNodeSource): GithubRepoNode {
  const topics = node.repositoryTopics?.nodes?.map((entry) => entry.topic.name) ?? [];
  return {
    name: node.name,
    url: node.url,
    openGraphImageUrl: node.openGraphImageUrl ?? "",
    description: node.description,
    descriptionHTML: node.descriptionHTML ?? "",
    homepageUrl: node.homepageUrl ?? "",
    nameWithOwner: node.nameWithOwner,
    pushedAt: node.pushedAt,
    isPrivate: Boolean(node.isPrivate),
    isFork: node.isFork,
    isArchived: node.isArchived,
    stargazerCount: node.stargazerCount,
    forkCount: node.forkCount,
    category: resolveRepositoryCategory(undefined, topics),
    repositoryTopics: {
      nodes: (node.repositoryTopics?.nodes ?? []).map((entry) => ({
        topic: { name: entry.topic.name },
      })),
    },
  };
}

/**
 * Short-lived cached GitHub list. Throws on failure so Next does not cache empty/error results.
 * Body only runs on cache miss — that is the audit signal for a real GraphQL fetch.
 */
async function loadGithubLandingReposCached(): Promise<GithubLandingRepos> {
  "use cache: remote";
  cacheLife(GITHUB_LIVE_CACHE_LIFE);
  cacheTag("landing-github-live-repos");

  if (!process.env.GH_PAT?.trim()) {
    logGithubTokenProblem("list");
    throw new Error("GH_PAT is not set; cannot load landing GitHub repos.");
  }

  console.warn(
    `${LOG_PREFIX} LIST cache miss → starting live GitHub fetch (revalidate=${GITHUB_LIVE_CACHE_LIFE.revalidate}s)`,
  );
  // Timing is safe inside `"use cache"` (Cache Component); do not use Date.now() in outer RSC helpers.
  const startedAt = Date.now();

  let listed;
  try {
    listed = await listGithubRepos({ recentLimit: 100 });
  } catch (err: unknown) {
    warnGithubFetchFailure(`LIST fetch failed after ${Date.now() - startedAt}ms`, err);
    throw err;
  }

  if (listed.repos.length === 0) {
    throw new Error("GitHub list returned zero public repositories.");
  }

  const byKey = new Map(
    listed.repos.map((entry) => [entry.node.nameWithOwner, toLandingRepo(entry.node)]),
  );

  const pinnedRepos = listed.pinnedKeys
    .map((key) => byKey.get(key))
    .filter((repo): repo is GithubRepoNode => repo != null);

  const recentRepos = [...byKey.values()].sort(
    (a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime(),
  );

  if (pinnedRepos.length === 0 && recentRepos.length === 0) {
    throw new Error("GitHub list mapped to zero pinned/recent repositories.");
  }

  console.warn(
    `${LOG_PREFIX} LIST cache miss → live GitHub ok in ${Date.now() - startedAt}ms · pinned=${pinnedRepos.length} recent=${recentRepos.length} total=${listed.repos.length}`,
  );

  return { pinnedRepos, recentRepos };
}

/**
 * Offline / e2e fixture list used when live GitHub and Payload both fail.
 */
function staticLandingRepos(): GithubLandingRepos {
  return {
    pinnedRepos: STATIC_PINNED_PROJECTS,
    recentRepos: STATIC_RECENT_PROJECTS,
  };
}

/**
 * Live GitHub pinned + recent repos for the landing projects section.
 *
 * 1. ~15m **remote**-cached GitHub GraphQL (shared across Vercel instances; skipped at build)
 * 2. Hour-cached Payload backup (throws on empty/unavailable → miss not cached)
 * 3. Static fixtures (keeps `#projects` / e2e working offline)
 */
export async function getCachedGithubLandingRepos(): Promise<GithubLandingRepos> {
  if (!isNextProductionBuild()) {
    try {
      return await loadGithubLandingReposCached();
    } catch (err: unknown) {
      warnGithubFetchFailure("LIST live GitHub failed → falling back to Payload", err);
    }
  } else {
    console.warn(`${LOG_PREFIX} LIST skipped live GitHub during next build → Payload`);
  }

  try {
    const payloadRepos = await loadPayloadLandingReposCached();
    console.warn(
      `${LOG_PREFIX} LIST using Payload backup · pinned=${payloadRepos.pinnedRepos.length} recent=${payloadRepos.recentRepos.length}`,
    );
    return payloadRepos;
  } catch (err: unknown) {
    console.warn(`${LOG_PREFIX} LIST Payload backup failed → static fixtures · ${shortErr(err)}`);
    const fixtures = staticLandingRepos();
    console.warn(
      `${LOG_PREFIX} LIST using static fixtures · pinned=${fixtures.pinnedRepos.length} recent=${fixtures.recentRepos.length}`,
    );
    return fixtures;
  }
}

/**
 * Short-lived single-repo GraphQL fetch. Throws on failure so errors are not cached.
 * Body only runs on cache miss — that is the audit signal for a real GraphQL fetch.
 */
async function loadGithubRepoDetailCached(owner: string, repo: string): Promise<GithubRepoNode> {
  "use cache: remote";
  cacheLife(GITHUB_LIVE_CACHE_LIFE);
  cacheTag(`github-repo_${owner}/${repo}`);

  const pat = process.env.GH_PAT?.trim();
  if (!pat) {
    logGithubTokenProblem(`detail:${owner}/${repo}`);
    throw new Error(`GH_PAT is not set; cannot load ${owner}/${repo}.`);
  }

  console.warn(`${LOG_PREFIX} DETAIL cache miss → starting live GitHub fetch · ${owner}/${repo}`);
  const startedAt = Date.now();

  let detail;
  try {
    detail = await createGitHubClient(pat).getRepoDetail(owner, repo);
  } catch (err: unknown) {
    warnGithubFetchFailure(
      `DETAIL fetch failed after ${Date.now() - startedAt}ms · ${owner}/${repo}`,
      err,
    );
    throw err;
  }

  if (!detail) {
    throw new Error(`GitHub returned no repository for ${owner}/${repo}.`);
  }
  if (detail.isPrivate) {
    console.warn(`${LOG_PREFIX} DETAIL ${owner}/${repo} is private — refusing`);
    throw new Error(`Repository ${owner}/${repo} is private.`);
  }

  const topics =
    detail.repositoryTopics?.edges?.map((edge) => edge.node.topic.name).filter(Boolean) ?? [];

  console.warn(
    `${LOG_PREFIX} DETAIL cache miss → live GitHub ok in ${Date.now() - startedAt}ms · ${owner}/${repo} · topics=${topics.length} · og=${detail.openGraphImageUrl ? "yes" : "no"}`,
  );

  return {
    name: detail.name,
    nameWithOwner: detail.nameWithOwner,
    url: detail.url,
    openGraphImageUrl: detail.openGraphImageUrl ?? "",
    description: detail.description || undefined,
    descriptionHTML: "",
    homepageUrl: detail.homepageUrl ?? "",
    pushedAt: detail.updatedAt,
    isPrivate: Boolean(detail.isPrivate),
    isFork: detail.isFork,
    forkCount: detail.forkCount,
    category: resolveRepositoryCategory(undefined, topics),
    repositoryTopics: {
      nodes: topics.map((topic) => ({ topic: { name: topic } })),
    },
  };
}

/**
 * Day-cached single-repo fetch (fallback when the repo is not in the landing list).
 * Logs and returns `null` on failure without caching the miss.
 */
async function getCachedGithubRepoDetail(
  owner: string,
  repo: string,
): Promise<GithubRepoNode | null> {
  if (isNextProductionBuild()) {
    console.warn(`${LOG_PREFIX} DETAIL skipped live GitHub during next build · ${owner}/${repo}`);
    return null;
  }

  try {
    return await loadGithubRepoDetailCached(owner, repo);
  } catch (err: unknown) {
    warnGithubFetchFailure(`DETAIL live GitHub failed · ${owner}/${repo}`, err);
    return null;
  }
}

/**
 * Resolves one public repo for project detail media.
 *
 * Prefers the short-lived landing list (same source as project cards) so the
 * View Transition morph keeps the same OG URL. Falls back to a short-lived
 * single-repo GraphQL fetch when the repo is outside that list.
 */
export async function getCachedGithubRepoByName(
  owner: string,
  repo: string,
): Promise<GithubRepoNode | null> {
  const nameWithOwner = `${owner}/${repo}`;

  const landing = await getCachedGithubLandingRepos();
  const fromLanding =
    landing.recentRepos.find((entry) => entry.nameWithOwner === nameWithOwner) ??
    landing.pinnedRepos.find((entry) => entry.nameWithOwner === nameWithOwner);
  if (fromLanding) {
    console.warn(`${LOG_PREFIX} DETAIL media source=landing-list · ${nameWithOwner}`);
    return fromLanding;
  }

  console.warn(
    `${LOG_PREFIX} DETAIL ${nameWithOwner} not in landing list (${landing.recentRepos.length} recent / ${landing.pinnedRepos.length} pinned) → single-repo GitHub fetch`,
  );
  const detail = await getCachedGithubRepoDetail(owner, repo);
  console.warn(
    `${LOG_PREFIX} DETAIL media source=${detail ? "single-repo" : "none"} · ${nameWithOwner}`,
  );
  return detail;
}
