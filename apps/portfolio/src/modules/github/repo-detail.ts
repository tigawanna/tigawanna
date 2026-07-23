import { STATIC_RECENT_PROJECTS } from "@/data/portfolio/static";
import { convertMarkdownToHtmlWithShiki } from "@/lib/markdown/convert";
import { getServerEnv } from "@/lib/envs/server-env";
import { createGitHubClient, type GithubRepoDetail, type GithubRepoNode } from "@repo/github";
import { createServerFn } from "@tanstack/react-start";
import { setPublicGithubCacheHeaders } from "./public-cache-headers";

/**
 * Maps a static portfolio repo fixture into the GraphQL detail shape used by
 * the project detail page when live GitHub data is unavailable.
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
 * Looks up a public static fixture by owner/repo for offline / e2e fallbacks.
 */
function findStaticPublicRepo(owner: string, repo: string) {
  const nameWithOwner = `${owner}/${repo}`;
  const match = STATIC_RECENT_PROJECTS.find((node) => node.nameWithOwner === nameWithOwner);
  if (!match || match.isPrivate) {
    return null;
  }
  return toStaticRepoDetail(match);
}

export const getRepoDetail = createServerFn({ method: "GET" })
  .validator((input: { owner: string; repo: string }) => input)
  .handler(async ({ data: { owner, repo } }) => {
    const pat = getServerEnv().GH_PAT;
    if (!pat) {
      return findStaticPublicRepo(owner, repo);
    }

    try {
      const detail = await createGitHubClient(pat).getRepoDetail(owner, repo);
      if (!detail || detail.isPrivate) {
        return findStaticPublicRepo(owner, repo);
      }

      setPublicGithubCacheHeaders();
      return detail;
    } catch {
      return findStaticPublicRepo(owner, repo);
    }
  });

/**
 * Fetches README markdown from GitHub and converts it to HTML.
 */
export async function fetchRepoReadmeHtml(owner: string, repo: string) {
  for (const branch of ["main", "master"]) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`,
      );
      if (!response.ok) continue;
      const text = await response.text();
      if (!text) continue;
      return await convertMarkdownToHtmlWithShiki(text);
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Returns a minimal README stand-in when the live GitHub README cannot be fetched.
 */
function staticReadmeHtml(owner: string, repo: string) {
  return `<h1>${repo}</h1><p>Static README fallback for <code>${owner}/${repo}</code>.</p>`;
}

export const getRepoReadmeHtml = createServerFn({ method: "GET" })
  .validator((input: { owner: string; repo: string }) => input)
  .handler(async ({ data: { owner, repo } }) => {
    const html = await fetchRepoReadmeHtml(owner, repo);
    if (html) {
      setPublicGithubCacheHeaders();
      return html;
    }
    return staticReadmeHtml(owner, repo);
  });
