import type { GithubRepoNode } from "@/types/github";

function repoSearchText(repo: GithubRepoNode) {
  const tags = repo.repositoryTopics?.nodes?.map((node) => node.topic.name).join(" ") ?? "";

  return [repo.name, repo.nameWithOwner, repo.description ?? "", tags].join(" ").toLowerCase();
}

export function matchesProjectSearch(repo: GithubRepoNode, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return repoSearchText(repo).includes(normalizedQuery);
}

export function filterReposByTopic(repos: GithubRepoNode[], topic: string) {
  if (topic === "all") return repos;

  const normalizedTopic = topic.toLowerCase();

  return repos.filter((repo) =>
    repo.repositoryTopics?.nodes?.some((node) => node.topic.name.toLowerCase() === normalizedTopic),
  );
}
