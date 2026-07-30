import { createGitHubClient, type GithubRepoNode } from "@repo/github";

/**
 * Resolves a GitHub PAT from env (`GH_PAT`).
 */
export function requireGithubPat(): string {
  const pat = process.env.GH_PAT?.trim();
  if (!pat) {
    throw new Error("Set GH_PAT to sync repositories from GitHub.");
  }
  return pat;
}

/** One repo from the pinned + recent listing, with pin status. */
export type ListedGithubRepo = {
  node: GithubRepoNode;
  featured: boolean;
};

export type ListGithubReposResult = {
  repos: ListedGithubRepo[];
  pinnedKeys: string[];
  pulledAt: string;
};

export type ListGithubReposOptions = {
  /** How many recent public repos to pull (default 100). */
  recentLimit?: number;
  /** Override token (defaults to `GH_PAT`). */
  token?: string;
};

/**
 * Lists GitHub pinned + recent public repos as DTOs (no Payload writes).
 *
 * Prefer the recent GraphQL node when a repo appears in both lists.
 *
 * @param options - Limit / token overrides.
 */
export async function listGithubRepos(
  options: ListGithubReposOptions = {},
): Promise<ListGithubReposResult> {
  const client = createGitHubClient(options.token ?? requireGithubPat());
  const recentLimit = options.recentLimit ?? 100;

  const [pinned, recentResult] = await Promise.all([
    client.getPinnedRepos(),
    client.getRecentRepos({ first: recentLimit, isFork: false }),
  ]);

  const recent = recentResult.data?.viewer.repositories.nodes ?? [];
  const pinnedKeys = new Set(pinned.map((repo) => repo.nameWithOwner));

  const byKey = new Map<string, GithubRepoNode>();
  for (const repo of recent) {
    byKey.set(repo.nameWithOwner, repo);
  }
  for (const repo of pinned) {
    if (!byKey.has(repo.nameWithOwner)) {
      byKey.set(repo.nameWithOwner, repo);
    }
  }

  const repos: ListedGithubRepo[] = [...byKey.values()].map((node) => ({
    node,
    featured: pinnedKeys.has(node.nameWithOwner),
  }));

  return {
    repos,
    pinnedKeys: [...pinnedKeys],
    pulledAt: new Date().toISOString(),
  };
}
