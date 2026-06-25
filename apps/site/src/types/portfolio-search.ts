import type { GithubRepoNode } from "@/types/github";
import { buildRepoSearchText, extractRepoTags } from "@/lib/github/fetch-repos";

export type RepoSearchResult = {
  nameWithOwner: string;
  name: string;
  description: string | null;
  tags: string[];
  url: string;
  homepageUrl: string | null;
  openGraphImageUrl: string | null;
  pushedAt: string | null;
  isPrivate: boolean;
  score: number;
  matchType: "semantic" | "keyword";
};

export function toGithubRepoNode(result: RepoSearchResult): GithubRepoNode {
  return {
    name: result.name,
    url: result.url,
    openGraphImageUrl: result.openGraphImageUrl ?? "",
    description: result.description ?? undefined,
    descriptionHTML: result.description ?? "",
    homepageUrl: result.homepageUrl ?? "",
    nameWithOwner: result.nameWithOwner,
    pushedAt: result.pushedAt ?? new Date(0).toISOString(),
    isPrivate: result.isPrivate,
    repositoryTopics: {
      nodes: result.tags.map((tag) => ({ topic: { name: tag } })),
    },
  };
}

export function repoToEmbeddingRecord(repo: GithubRepoNode, embedding: number[]) {
  const tags = extractRepoTags(repo);

  return {
    nameWithOwner: repo.nameWithOwner,
    name: repo.name,
    description: repo.description ?? null,
    tags,
    url: repo.url,
    homepageUrl: repo.homepageUrl || null,
    openGraphImageUrl: repo.openGraphImageUrl || null,
    pushedAt: repo.pushedAt,
    isPrivate: repo.isPrivate,
    searchText: buildRepoSearchText(repo),
    embedding,
    embeddedAt: new Date().toISOString(),
  };
}
