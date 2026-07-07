import { convertMarkdownToHtmlWithShiki } from "@/lib/markdown/convert";
import { getServerEnv } from "@/lib/envs/server-env";
import { createGitHubClient } from "@repo/github";
import { createServerFn } from "@tanstack/react-start";

export const getRepoDetail = createServerFn({ method: "GET" })
  .validator((input: { owner: string; repo: string }) => input)
  .handler(async ({ data: { owner, repo } }) => {
    const pat = getServerEnv().GH_PAT;
    if (!pat) {
      return null;
    }

    return createGitHubClient(pat).getRepoDetail(owner, repo);
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

export const getRepoReadmeHtml = createServerFn({ method: "GET" })
  .validator((input: { owner: string; repo: string }) => input)
  .handler(async ({ data: { owner, repo } }) => fetchRepoReadmeHtml(owner, repo));
