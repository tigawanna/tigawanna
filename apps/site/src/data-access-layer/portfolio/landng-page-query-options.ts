import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { getLesson, getLessonMarkdownHtml, getLessonsPreview } from "@/modules/lessons/lessons";
import { getLandingLessonPreviews } from "@/modules/lessons/landing-lessons.functions";
import { queryOptions } from "@tanstack/react-query";
import { getPinnedRepos, getRecentRepos } from "@/modules/github/repos";

/** Align client refetch with Vercel CDN TTL on the GitHub server functions. */
const GITHUB_REPOS_STALE_TIME_MS = 60 * 60 * 1000;

export const pinnedReposQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.github, "repos", "pinned"],
  queryFn: () => getPinnedRepos(),
  staleTime: GITHUB_REPOS_STALE_TIME_MS,
});

export const recentReposQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.github, "repos", "recent"],
  queryFn: () => getRecentRepos(),
  staleTime: GITHUB_REPOS_STALE_TIME_MS,
});

export function lessonsListQueryOptions(page: number, perPage: number) {
  return queryOptions({
    queryKey: [queryKeyPrefixes.lessons, "list", page, perPage],
    queryFn: async () => getLessonsPreview({ data: { page, perPage } }),
  });
}

export const landingLessonPreviewsQueryOptions = queryOptions({
  queryKey: [queryKeyPrefixes.lessons, "landing-previews"],
  queryFn: () => getLandingLessonPreviews(),
});

export const lessonQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["lessons", "detail", id],
    queryFn: async () => {
      const lesson = await getLesson({ data: { id } });
      if (!lesson) {
        throw new Error("Lesson not found");
      }
      return lesson;
    },
  });

export const lessonHtmlQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["lessons", "html", id],
    queryFn: () => getLessonMarkdownHtml({ data: { id } }),
  });
