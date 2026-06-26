import { getLessonsPreview } from "@/lib/lessons/lessons";
import { queryOptions } from "@tanstack/react-query";

export function lessonsListQueryOptions(page: number, perPage: number) {
  return queryOptions({
    queryKey: ["lessons", "list", page, perPage],
    queryFn: async () => getLessonsPreview({ data: { page, perPage } }),
  });
}
