import type { GithubRepoSnapshot } from "@/modules/project-enrichment/github-client";

const MONOREPO_PACKAGE_ROOTS = ["apps", "packages", "libs", "tools"] as const;
const MAX_PACKAGE_JSON_FILES = 15;
const MAX_README_CHARS = 12_000;
const MAX_PACKAGE_JSON_CHARS = 6_000;

type TreeResponse = {
  tree: { path: string; type: string }[];
};

type ContentResponse = {
  content: string;
  encoding: string;
};

export type PackageJsonChunk = {
  path: string;
  content: Record<string, unknown>;
};

export type RepoExtraction = {
  filePaths: string[];
  readme: string | null;
  readmePath: string | null;
  packageJsonChunks: PackageJsonChunk[];
};

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

async function githubRest<T>(token: string, path: string) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub REST ${path} failed: ${res.status} ${body}`);
  }

  return (await res.json()) as T;
}

function decodeContent(content: string) {
  return Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8");
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
 * Fetches README and nested package.json files from a GitHub repository.
 */
export async function fetchRepoExtraction(token: string, repo: GithubRepoSnapshot) {
  const tree = await githubRest<TreeResponse>(
    token,
    `/repos/${repo.nameWithOwner}/git/trees/${repo.defaultBranch}?recursive=1`,
  );
  const filePaths =
    tree?.tree.filter((entry) => entry.type === "blob").map((entry) => entry.path) ?? [];

  const packageJsonPaths = discoverPackageJsonPaths(filePaths);
  const packageJsonChunks: PackageJsonChunk[] = [];

  for (const path of packageJsonPaths) {
    const content = await githubRest<ContentResponse>(
      token,
      `/repos/${repo.nameWithOwner}/contents/${path}?ref=${repo.defaultBranch}`,
    );

    if (content?.encoding !== "base64") {
      continue;
    }

    try {
      const parsed = JSON.parse(decodeContent(content.content)) as Record<string, unknown>;
      packageJsonChunks.push({ path, content: parsed });
    } catch {
      // ignore invalid package.json
    }
  }

  const readmePath = findReadmePath(filePaths);
  let readme: string | null = null;

  if (readmePath) {
    const content = await githubRest<ContentResponse>(
      token,
      `/repos/${repo.nameWithOwner}/contents/${readmePath}?ref=${repo.defaultBranch}`,
    );

    if (content?.encoding === "base64") {
      readme = decodeContent(content.content).slice(0, MAX_README_CHARS);
    }
  }

  return {
    filePaths,
    readme,
    readmePath,
    packageJsonChunks,
  } satisfies RepoExtraction;
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
