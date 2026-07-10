import type { GitHubClient } from "../client.js";
import type { GitTreeEntry, GithubRepoSnapshot } from "../types.js";
import { discoverManifestCandidates } from "./manifest-paths.js";
import { parseManifest } from "./parse-manifest.js";
import type { RepoArtifact, SpelunkPayload } from "./types.js";

const MAX_README_CHARS = 12_000;
const MAX_FILE_PATHS = 500;

/**
 * Collects tree paths, README, and parsed language manifests for a repo.
 * GitHub API only — no DB writes.
 */
export async function collectArtifacts(
  client: GitHubClient,
  repo: GithubRepoSnapshot,
): Promise<SpelunkPayload> {
  const { owner, repo: repoName } = splitRepoFullName(repo.nameWithOwner);
  const tree = await client.getRepoTree(owner, repoName, repo.defaultBranch, true);
  const filePaths =
    tree
      ?.filter((entry: GitTreeEntry) => entry.type === "blob")
      .map((entry) => entry.path)
      .slice(0, MAX_FILE_PATHS) ?? [];

  const candidates = discoverManifestCandidates(filePaths);
  const artifacts: RepoArtifact[] = [];

  for (const candidate of candidates) {
    const content = await client.getRepoFileContent(
      owner,
      repoName,
      candidate.path,
      repo.defaultBranch,
    );
    if (!content) {
      continue;
    }
    const artifact = parseManifest(candidate, content);
    if (artifact) {
      artifacts.push(artifact);
    }
  }

  const readmePath = findReadmePath(filePaths);
  let readme: string | null = null;
  if (readmePath) {
    const content = await client.getRepoFileContent(
      owner,
      repoName,
      readmePath,
      repo.defaultBranch,
    );
    if (content) {
      readme = content.slice(0, MAX_README_CHARS);
    }
  }

  return { filePaths, readme, readmePath, artifacts };
}

/**
 * Finds the root README.md path (case-insensitive), if any.
 */
export function findReadmePath(filePaths: string[]) {
  return filePaths.find((path) => /^readme\.md$/i.test(path)) ?? null;
}

function splitRepoFullName(nameWithOwner: string) {
  const [owner, repoName] = nameWithOwner.split("/");
  if (!owner || !repoName) {
    throw new Error("Invalid repository full name");
  }
  return { owner, repo: repoName };
}
