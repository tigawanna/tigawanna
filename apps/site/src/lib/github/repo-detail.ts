import type { OneRepoGQL } from "@/types/github";
import { createServerFn } from "@tanstack/react-start";

const REPO_QUERY = `
query OneRepo($owner: String!, $repo: String!, $firstTopics: Int!, $firstLangs: Int!) {
  repository(name: $repo, owner: $owner) {
    createdAt
    forkCount
    id
    homepageUrl
    isPrivate
    isFork
    isEmpty
    description
    isTemplate
    repositoryTopics(first: $firstTopics) {
      edges {
        node {
          topic { name }
        }
      }
    }
    name
    nameWithOwner
    openGraphImageUrl
    updatedAt
    url
    languages(first: $firstLangs) {
      edges {
        size
        node { color name }
      }
      totalSize
    }
  }
}`;

export const getRepoDetail = createServerFn({ method: "GET" })
  .inputValidator((input: { owner: string; repo: string }) => input)
  .handler(async ({ data: { owner, repo } }) => {
    const pat = process.env.GH_PAT;
    if (!pat) {
      return null;
    }

    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pat}`,
      },
      body: JSON.stringify({
        query: REPO_QUERY,
        variables: { owner, repo, firstTopics: 10, firstLangs: 10 },
      }),
    });

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()) as OneRepoGQL;
    return json.data?.repository ?? null;
  });

export const getRepoReadmeHtml = createServerFn({ method: "GET" })
  .inputValidator((input: { owner: string; repo: string }) => input)
  .handler(async ({ data: { owner, repo } }) => {
    const { convertMarkdownToHtml } = await import("@/lib/markdown/convert");

    for (const branch of ["main", "master"]) {
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`,
        );
        if (!response.ok) continue;
        const text = await response.text();
        if (!text) continue;
        return convertMarkdownToHtml(text);
      } catch {
        continue;
      }
    }

    return null;
  });
