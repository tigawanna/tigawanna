const MONOREPO_PACKAGE_ROOTS = ["apps", "packages", "libs", "tools"] as const;
const MAX_PACKAGE_JSON_FILES = 15;
const MAX_README_CHARS = 12_000;
const MAX_PACKAGE_JSON_CHARS = 6_000;

import type {
  GitTreeEntry,
  GithubRepoSnapshot,
  PackageJsonChunk,
  RepoExtraction,
} from "./types.js";
import type { GitHubClient } from "./client.js";

/**
 * Returns the root `package.json` content when present in extraction chunks.
 */
export function getRootPackageJson(chunks: PackageJsonChunk[]) {
  return chunks.find((chunk) => chunk.path === "package.json")?.content ?? null;
}

/**
 * Returns nested workspace package.json chunks (excludes the repo root).
 */
export function getWorkspacePackageChunks(chunks: PackageJsonChunk[]) {
  return chunks.filter((chunk) => chunk.path !== "package.json");
}

/**
 * Heuristic: repo has at least one workspace package under apps/packages/libs/tools.
 */
export function isMonorepoExtraction(extraction: Pick<RepoExtraction, "packageJsonChunks">) {
  return getWorkspacePackageChunks(extraction.packageJsonChunks).length > 0;
}

function discoverPackageJsonPaths(filePaths: string[]) {
  const paths = new Set<string>();

  if (filePaths.includes("package.json")) {
    paths.add("package.json");
  }

  for (const root of MONOREPO_PACKAGE_ROOTS) {
    for (const path of filePaths) {
      if (new RegExp(`^${root}/[^/]+/package\\.json$`).test(path)) {
        paths.add(path);
      }
    }
  }

  return [...paths].slice(0, MAX_PACKAGE_JSON_FILES);
}

function findReadmePath(filePaths: string[]) {
  const readmeCandidates = filePaths.filter((path) => /^readme\.md$/i.test(path));
  return readmeCandidates[0] ?? null;
}

/**
 * Builds a compact text summary from a package.json file for embedding.
 */
export function summarizePackageJson(path: string, content: Record<string, unknown>) {
  const dependencies =
    content.dependencies && typeof content.dependencies === "object"
      ? Object.keys(content.dependencies as Record<string, string>)
      : [];
  const devDependencies =
    content.devDependencies && typeof content.devDependencies === "object"
      ? Object.keys(content.devDependencies as Record<string, string>)
      : [];
  const scripts =
    content.scripts && typeof content.scripts === "object"
      ? Object.keys(content.scripts as Record<string, string>)
      : [];

  const parts = [
    `Package: ${path}`,
    typeof content.name === "string" ? `name: ${content.name}` : null,
    typeof content.description === "string" ? `description: ${content.description}` : null,
    dependencies.length > 0 ? `dependencies: ${dependencies.slice(0, 40).join(", ")}` : null,
    devDependencies.length > 0
      ? `devDependencies: ${devDependencies.slice(0, 25).join(", ")}`
      : null,
    scripts.length > 0 ? `scripts: ${scripts.slice(0, 20).join(", ")}` : null,
  ].filter((part): part is string => Boolean(part));

  return parts.join("\n").slice(0, MAX_PACKAGE_JSON_CHARS);
}

/**
 * Heuristic: does the README contain enough prose to count as a description?
 */
export function readmeHasDescription(readme: string) {
  return readme.split("\n").some((line) => {
    const trimmed = line.trim();
    return (
      trimmed.length > 40 &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("![") &&
      !trimmed.startsWith("|") &&
      !trimmed.startsWith("```")
    );
  });
}

/**
 * Heuristic: does the README mention tags or topics?
 */
export function readmeHasTags(readme: string) {
  return /\b(tags?|topics?)\s*:/i.test(readme) || /(^|\s)#[\w-]+/m.test(readme);
}

/**
 * Fetches README and nested package.json files from a GitHub repository.
 */
export async function fetchRepoExtraction(
  client: GitHubClient,
  repo: GithubRepoSnapshot,
): Promise<RepoExtraction> {
  const { owner, repo: repoName } = splitRepoFullNameFromSnapshot(repo);
  const tree = await client.getRepoTree(owner, repoName, repo.defaultBranch, true);
  const filePaths =
    tree?.filter((entry: GitTreeEntry) => entry.type === "blob").map((entry) => entry.path) ?? [];

  const packageJsonPaths = discoverPackageJsonPaths(filePaths);
  const packageJsonChunks: PackageJsonChunk[] = [];

  for (const path of packageJsonPaths) {
    const content = await client.getRepoFileContent(owner, repoName, path, repo.defaultBranch);
    if (!content) {
      continue;
    }

    try {
      const parsed = JSON.parse(content) as Record<string, unknown>;
      packageJsonChunks.push({ path, content: parsed });
    } catch {
      // ignore invalid package.json
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

  return {
    filePaths,
    readme,
    readmePath,
    packageJsonChunks,
  };
}

/**
 * Fetches file paths and root package.json for lightweight repo analysis.
 */
export async function fetchRepoAnalysis(client: GitHubClient, repo: GithubRepoSnapshot) {
  const { owner, repo: repoName } = splitRepoFullNameFromSnapshot(repo);
  const tree = await client.getRepoTree(owner, repoName, repo.defaultBranch, true);
  const filePaths =
    tree
      ?.filter((entry: GitTreeEntry) => entry.type === "blob")
      .map((entry) => entry.path)
      .slice(0, 500) ?? [];

  const hasPackageJson = filePaths.includes("package.json");
  let packageJson: Record<string, unknown> | null = null;

  if (hasPackageJson) {
    const content = await client.getRepoFileContent(
      owner,
      repoName,
      "package.json",
      repo.defaultBranch,
    );

    if (content) {
      try {
        packageJson = JSON.parse(content) as Record<string, unknown>;
      } catch {
        packageJson = null;
      }
    }
  }

  return { filePaths, packageJson };
}

function splitRepoFullNameFromSnapshot(repo: GithubRepoSnapshot) {
  const [owner, repoName] = repo.nameWithOwner.split("/");
  if (!owner || !repoName) {
    throw new Error("Invalid repository full name");
  }
  return { owner, repo: repoName };
}
