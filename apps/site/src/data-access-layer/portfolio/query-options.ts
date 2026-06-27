import { queryKeyPrefixes } from "@/data-access-layer/query-keys";
import { getLessonsPreview } from "@/modules/lessons/lessons";
import { getLandingLessonPreviews } from "@/modules/lessons/landing-lessons.functions";
import { queryOptions } from "@tanstack/react-query";

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
