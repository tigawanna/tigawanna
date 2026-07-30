import type { GithubRepoNode } from "../../../types/github";
import { matchesProjectRelevance } from "../../../modules/find-relevant-projects";

function repoSearchText(repo: GithubRepoNode) {
  const tags = repo.repositoryTopics?.nodes?.map((node) => node.topic.name).join(" ") ?? "";

  return [repo.name, repo.nameWithOwner, repo.description ?? "", tags, repo.category ?? ""]
    .join(" ")
    .toLowerCase();
}

/**
 * Returns whether a repository matches a free-text search query.
 */
export function matchesProjectSearch(repo: GithubRepoNode, query: string) {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return true;

  if (matchesProjectRelevance(repo, normalizedQuery)) {
    return true;
  }

  const normalizedQueryLower = normalizedQuery.toLowerCase();
  return repoSearchText(repo).includes(normalizedQueryLower);
}

/**
 * Filters repositories by a GitHub topic tag (`all` = no filter).
 */
export function filterReposByTopic(repos: GithubRepoNode[], topic: string) {
  if (topic === "all") return repos;

  const normalizedTopic = topic.toLowerCase();

  return repos.filter((repo) =>
    repo.repositoryTopics?.nodes?.some((node) => node.topic.name.toLowerCase() === normalizedTopic),
  );
}

/**
 * Filters repositories by curated CMS category (`all` = no filter).
 */
export function filterReposByCategory(repos: GithubRepoNode[], category: string) {
  if (category === "all") return repos;

  const normalized = category.toLowerCase();
  return repos.filter((repo) => (repo.category ?? "").toLowerCase() === normalized);
}
