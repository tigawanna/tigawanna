export type GithubRepoSnapshot = {
  id: string;
  name: string;
  nameWithOwner: string;
  description: string | null;
  homepageUrl: string | null;
  openGraphImageUrl: string | null;
  topics: string[];
  defaultBranch: string;
};

export type RepoAnalysis = {
  filePaths: string[];
  packageJson: Record<string, unknown> | null;
};

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
          openGraphImageUrl
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
    openGraphImageUrl
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
  openGraphImageUrl: string | null;
  isPrivate: boolean;
  defaultBranchRef: { name: string } | null;
  repositoryTopics: {
    nodes: { topic: { name: string } }[];
  };
};

function mapRepo(node: GraphqlRepoNode): GithubRepoSnapshot {
  return {
    id: node.id,
    name: node.name,
    nameWithOwner: node.nameWithOwner,
    description: node.description,
    homepageUrl: node.homepageUrl,
    openGraphImageUrl: node.openGraphImageUrl,
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
  const result = await githubGraphql<{
    data: { viewer: { repositories: { nodes: (GraphqlRepoNode | null)[] } } };
  }>(token, RECENT_REPOS_QUERY, { first: limit });

  return (result.data.viewer.repositories.nodes ?? [])
    .filter((node): node is GraphqlRepoNode => node != null && !node.isPrivate)
    .map(mapRepo);
}

export async function fetchReposByFullNames(token: string, fullNames: string[]) {
  const repos: GithubRepoSnapshot[] = [];

  for (const fullName of fullNames) {
    const [owner, name] = fullName.split("/");
    if (!owner || !name) {
      continue;
    }

    const result = await githubGraphql<{
      data: { repository: GraphqlRepoNode | null };
    }>(token, REPO_BY_NAME_QUERY, { owner, name });

    const node = result.data.repository;
    if (node && !node.isPrivate) {
      repos.push(mapRepo(node));
    }
  }

  return repos;
}

async function githubRest<T>(token: string, path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/vnd.github+json");
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("X-GitHub-Api-Version", "2022-11-28");

  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers,
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
  truncated: boolean;
  tree: { path: string; type: string }[];
};

type ContentResponse = {
  content: string;
  encoding: string;
};

function decodeContent(content: string) {
  return atob(content.replace(/\n/g, ""));
}

export async function fetchRepoAnalysis(
  token: string,
  repo: GithubRepoSnapshot,
): Promise<RepoAnalysis> {
  const tree = await githubRest<TreeResponse>(
    token,
    `/repos/${repo.nameWithOwner}/git/trees/${repo.defaultBranch}?recursive=1`,
  );

  const filePaths =
    tree?.tree
      .filter((entry) => entry.type === "blob")
      .map((entry) => entry.path)
      .slice(0, 500) ?? [];

  const hasPackageJson = filePaths.includes("package.json");
  let packageJson: Record<string, unknown> | null = null;

  if (hasPackageJson) {
    const content = await githubRest<ContentResponse>(
      token,
      `/repos/${repo.nameWithOwner}/contents/package.json?ref=${repo.defaultBranch}`,
    );

    if (content?.encoding === "base64") {
      try {
        packageJson = JSON.parse(decodeContent(content.content)) as Record<string, unknown>;
      } catch {
        packageJson = null;
      }
    }
  }

  return { filePaths, packageJson };
}

export function hasCustomSocialPreview(url: string | null) {
  return Boolean(url?.includes("repository-images.githubusercontent.com"));
}

export function isRepoMetadataComplete(repo: Pick<GithubRepoSnapshot, "description" | "topics">) {
  const hasDescription = (repo.description?.trim().length ?? 0) > 0;
  const hasTopics = repo.topics.length > 0;
  return hasDescription && hasTopics;
}
