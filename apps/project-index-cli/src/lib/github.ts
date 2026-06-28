import type { GithubRepoSnapshot, PackageJsonChunk, RepoExtraction } from "./types.js";

const RECENT_REPOS_QUERY = `query getViewerRecentlyPushedRepos($first: Int!) {
  viewer {
    repositories(orderBy: { field: PUSHED_AT, direction: DESC }, first: $first, isFork: false) {
      nodes {
        ... on Repository {
          id
          name
          nameWithOwner
          description
          homepageUrl
          url
          isPrivate
          defaultBranchRef { name }
          repositoryTopics(first: 20) {
            nodes { topic { name } }
          }
        }
      }
    }
  }
}`;

const REPO_BY_NAME_QUERY = `query getRepoByName($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    id
    name
    nameWithOwner
    description
    homepageUrl
    url
    isPrivate
    defaultBranchRef { name }
    repositoryTopics(first: 20) {
      nodes { topic { name } }
    }
  }
}`;

type GraphqlRepoNode = {
  id: string;
  name: string;
  nameWithOwner: string;
  description: string | null;
  homepageUrl: string | null;
  url: string;
  isPrivate: boolean;
  defaultBranchRef: { name: string } | null;
  repositoryTopics: {
    nodes: { topic: { name: string } }[];
  };
};

const MONOREPO_PACKAGE_ROOTS = ["apps", "packages", "libs", "tools"] as const;
const MAX_PACKAGE_JSON_FILES = 15;
const MAX_README_CHARS = 12_000;
const MAX_PACKAGE_JSON_CHARS = 6_000;

function mapRepo(node: GraphqlRepoNode): GithubRepoSnapshot {
  return {
    id: node.id,
    name: node.name,
    nameWithOwner: node.nameWithOwner,
    description: node.description,
    homepageUrl: node.homepageUrl,
    url: node.url,
    topics: node.repositoryTopics.nodes
      .map((entry) => entry.topic.name)
      .filter((name) => name.length > 0),
    defaultBranch: node.defaultBranchRef?.name ?? "main",
  };
}

async function githubGraphql<T>(token: string, query: string, variables?: Record<string, unknown>) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GitHub GraphQL failed: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as T & { errors?: { message: string }[]; data?: unknown };
  if (json.errors?.length && json.data == null) {
    throw new Error(json.errors.map((error) => error.message).join("; "));
  }

  return json;
}

export async function fetchRecentRepos(token: string, limit: number) {
  console.log(`[github] GraphQL: recent repos (limit=${limit})`);
  const result = await githubGraphql<{
    data: { viewer: { repositories: { nodes: (GraphqlRepoNode | null)[] } } };
  }>(token, RECENT_REPOS_QUERY, { first: limit });

  const repos = (result.data.viewer.repositories.nodes ?? [])
    .filter((node): node is GraphqlRepoNode => node != null && !node.isPrivate)
    .map(mapRepo);

  console.log(`[github] GraphQL: ${repos.length} public repos returned`);
  return repos;
}

export async function fetchReposByFullNames(token: string, fullNames: string[]) {
  const repos: GithubRepoSnapshot[] = [];

  for (const fullName of fullNames) {
    const [owner, name] = fullName.split("/");
    if (!owner || !name) {
      console.log(`[github] skipping invalid repo name: ${fullName}`);
      continue;
    }

    console.log(`[github] GraphQL: lookup ${fullName}`);
    const result = await githubGraphql<{
      data: { repository: GraphqlRepoNode | null };
    }>(token, REPO_BY_NAME_QUERY, { owner, name });

    const node = result.data.repository;
    if (node && !node.isPrivate) {
      repos.push(mapRepo(node));
      console.log(`[github] found ${fullName} (branch=${node.defaultBranchRef?.name ?? "main"})`);
    } else if (node?.isPrivate) {
      console.log(`[github] skipped ${fullName} — private repo`);
    } else {
      console.log(`[github] not found: ${fullName}`);
    }
  }

  return repos;
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

type TreeResponse = {
  tree: { path: string; type: string }[];
};

type ContentResponse = {
  content: string;
  encoding: string;
};

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
    typeof content.version === "string" ? `version: ${content.version}` : null,
    dependencies.length > 0 ? `dependencies: ${dependencies.slice(0, 40).join(", ")}` : null,
    devDependencies.length > 0
      ? `devDependencies: ${devDependencies.slice(0, 25).join(", ")}`
      : null,
    scripts.length > 0 ? `scripts: ${scripts.slice(0, 20).join(", ")}` : null,
  ].filter((part): part is string => Boolean(part));

  return parts.join("\n").slice(0, MAX_PACKAGE_JSON_CHARS);
}

export async function fetchRepoExtraction(
  token: string,
  repo: GithubRepoSnapshot,
): Promise<RepoExtraction> {
  console.log(`[extract] ${repo.nameWithOwner} — fetching git tree (${repo.defaultBranch})…`);
  const tree = await githubRest<TreeResponse>(
    token,
    `/repos/${repo.nameWithOwner}/git/trees/${repo.defaultBranch}?recursive=1`,
  );

  const filePaths =
    tree?.tree.filter((entry) => entry.type === "blob").map((entry) => entry.path) ?? [];

  console.log(`[extract] ${repo.nameWithOwner} — ${filePaths.length} files in tree`);

  const packageJsonPaths = discoverPackageJsonPaths(filePaths);
  console.log(
    `[extract] ${repo.nameWithOwner} — ${packageJsonPaths.length} package.json candidate(s): ${packageJsonPaths.join(", ") || "(none)"}`,
  );

  const packageJsonChunks: PackageJsonChunk[] = [];

  for (const path of packageJsonPaths) {
    console.log(`[extract] ${repo.nameWithOwner} — reading ${path}`);
    const content = await githubRest<ContentResponse>(
      token,
      `/repos/${repo.nameWithOwner}/contents/${path}?ref=${repo.defaultBranch}`,
    );

    if (content?.encoding !== "base64") {
      console.log(`[extract] ${repo.nameWithOwner} — skipped ${path} (not base64)`);
      continue;
    }

    try {
      const parsed = JSON.parse(decodeContent(content.content)) as Record<string, unknown>;
      packageJsonChunks.push({ path, content: parsed });
      const pkgName = typeof parsed.name === "string" ? parsed.name : path;
      console.log(`[extract] ${repo.nameWithOwner} — parsed ${path} (${pkgName})`);
    } catch {
      console.log(`[extract] ${repo.nameWithOwner} — failed to parse ${path}`);
    }
  }

  const readmePath = findReadmePath(filePaths);
  let readme: string | null = null;

  if (readmePath) {
    console.log(`[extract] ${repo.nameWithOwner} — reading ${readmePath}`);
    const content = await githubRest<ContentResponse>(
      token,
      `/repos/${repo.nameWithOwner}/contents/${readmePath}?ref=${repo.defaultBranch}`,
    );

    if (content?.encoding === "base64") {
      readme = decodeContent(content.content).slice(0, MAX_README_CHARS);
      console.log(`[extract] ${repo.nameWithOwner} — readme ${readme.length} chars`);
    }
  } else {
    console.log(`[extract] ${repo.nameWithOwner} — no README found`);
  }

  return {
    filePaths,
    readme,
    readmePath,
    packageJsonChunks,
  };
}

export function hasDescription(repo: Pick<GithubRepoSnapshot, "description">) {
  return (repo.description?.trim().length ?? 0) > 0;
}

export function hasTopics(repo: Pick<GithubRepoSnapshot, "topics">) {
  return repo.topics.length > 0;
}

export function isRepoFullyEnriched(repo: Pick<GithubRepoSnapshot, "description" | "topics">) {
  return hasDescription(repo) && hasTopics(repo);
}

export async function applyGithubMetadata(
  token: string,
  repoFullName: string,
  metadata: { description: string; topics: string[] },
) {
  console.log(`[github] PATCH ${repoFullName} description (${metadata.description.length} chars)`);
  console.log(`[github] PUT ${repoFullName} topics: ${metadata.topics.join(", ")}`);

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };

  const repoRes = await fetch(`https://api.github.com/repos/${repoFullName}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ description: metadata.description }),
  });

  if (!repoRes.ok) {
    const body = await repoRes.text();
    throw new Error(`GitHub PATCH repo failed: ${repoRes.status} ${body}`);
  }

  const topicsRes = await fetch(`https://api.github.com/repos/${repoFullName}/topics`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ names: metadata.topics }),
  });

  if (!topicsRes.ok) {
    const body = await topicsRes.text();
    throw new Error(`GitHub PUT topics failed: ${topicsRes.status} ${body}`);
  }

  console.log(`[github] metadata applied to ${repoFullName}`);
}
