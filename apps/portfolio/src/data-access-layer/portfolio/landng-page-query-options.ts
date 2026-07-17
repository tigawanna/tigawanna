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

/** Default page size for the public lessons index. */
export const LESSONS_LIST_PER_PAGE = 24;

export function lessonsListQueryOptions({
  page,
  perPage = LESSONS_LIST_PER_PAGE,
  q = "",
  sortBy = "latest",
  pinnedFirst = false,
}: {
  page: number;
  perPage?: number;
  q?: string;
  sortBy?: "latest" | "oldest";
  pinnedFirst?: boolean;
}) {
  const query = q.trim();
  return queryOptions({
    queryKey: [queryKeyPrefixes.lessons, "list", page, perPage, query, sortBy, pinnedFirst],
    queryFn: async () =>
      getLessonsPreview({
        data: {
          page,
          perPage,
          q: query || undefined,
          sortBy,
          pinnedFirst,
        },
      }),
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
