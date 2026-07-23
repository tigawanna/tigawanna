/**
 * Static GitHub envelopes used when Playwright stubs `/_serverFn` repo queries.
 */
import { STATIC_PINNED_PROJECTS, STATIC_RECENT_PROJECTS } from "../../../src/data/portfolio/static";
import type { GithubRepoDetail, GithubRepoNode } from "../../../src/types/github";

export const mockViewerReposResult = {
  data: {
    viewer: {
      pinnedItems: { nodes: STATIC_PINNED_PROJECTS },
      repositories: { nodes: STATIC_RECENT_PROJECTS },
    },
  },
  errors: [],
};

/**
 * Maps a static portfolio repo fixture into the GraphQL detail shape.
 */
function toStaticRepoDetail(node: GithubRepoNode): GithubRepoDetail {
  return {
    createdAt: node.pushedAt,
    forkCount: node.forkCount ?? 0,
    id: `static:${node.nameWithOwner}`,
    homepageUrl: node.homepageUrl,
    isPrivate: node.isPrivate,
    description: node.description ?? "",
    isFork: node.isFork ?? false,
    isEmpty: false,
    isTemplate: false,
    repositoryTopics: {
      edges: (node.repositoryTopics?.nodes ?? []).map((topic) => ({ node: topic })),
    },
    name: node.name,
    nameWithOwner: node.nameWithOwner,
    openGraphImageUrl: node.openGraphImageUrl,
    updatedAt: node.pushedAt,
    url: node.url,
    languages: {
      edges: [{ size: 1, node: { color: "#3178c6", name: "TypeScript" } }],
      totalSize: 1,
    },
  };
}

/**
 * Returns a static repo detail for the first pinned fixture (matches project-detail e2e).
 */
export function mockRepoDetailResult() {
  return toStaticRepoDetail(STATIC_PINNED_PROJECTS[0]);
}

/**
 * Minimal README HTML used when stubbing `getRepoReadmeHtml`.
 */
export function mockRepoReadmeHtml(owner = "tigawanna", repo = "tigawanna") {
  return `<h1>${repo}</h1><p>Static README fallback for <code>${owner}/${repo}</code>.</p>`;
}
