import { getDevtoArticles } from "@/lib/devto/articles";
import { getPinnedRepos, getRecentRepos } from "@/lib/github/repos";
import { getLessonsPreview } from "@/lib/lessons/lessons";
import { queryOptions } from "@tanstack/react-query";

export const pinnedReposQueryOptions = queryOptions({
  queryKey: ["github", "pinned"],
  queryFn: () => getPinnedRepos(),
});

export const recentReposQueryOptions = queryOptions({
  queryKey: ["github", "recent"],
  queryFn: () => getRecentRepos(),
});

export const devtoArticlesQueryOptions = queryOptions({
  queryKey: ["devto", "articles"],
  queryFn: () => getDevtoArticles(),
});

export const lessonsPreviewQueryOptions = queryOptions({
  queryKey: ["lessons", "preview"],
  queryFn: () => getLessonsPreview({ data: { page: 1, perPage: 6 } }),
});

export const lessonsListQueryOptions = (page: number, perPage: number) =>
  queryOptions({
    queryKey: ["lessons", "list", page, perPage],
    queryFn: () => getLessonsPreview({ data: { page, perPage } }),
  });
