import { buildLessonPreviews } from "@/modules/lessons/build-lesson-previews";
import { fetchLesson, fetchLessonsPage, type LessonSortBy } from "@/modules/lessons/lessons.server";
import { convertMarkdownToHtmlWithShiki } from "@/lib/markdown/convert";
import type { LessonsPreviewPage } from "@/types/lessons";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const lessonsListInputSchema = z.object({
  page: z.number().int().positive().optional(),
  perPage: z.number().int().positive().max(100).optional(),
  q: z.string().optional(),
  sortBy: z.enum(["latest", "oldest"]).optional(),
  pinnedFirst: z.boolean().optional(),
});

type LessonsListInput = z.infer<typeof lessonsListInputSchema>;

export const getLessons = createServerFn({ method: "GET" })
  .validator((input: LessonsListInput) => lessonsListInputSchema.parse(input))
  .handler(async ({ data: { page = 1, perPage = 6, q, sortBy, pinnedFirst } }) =>
    fetchLessonsPage(page, perPage, { q, sortBy, pinnedFirst }),
  );

export const getLessonsPreview = createServerFn({ method: "GET" })
  .validator((input: LessonsListInput) => lessonsListInputSchema.parse(input))
  .handler(async ({ data: { page = 1, perPage = 6, q, sortBy, pinnedFirst } }) => {
    const result = await fetchLessonsPage(page, perPage, { q, sortBy, pinnedFirst });
    if (!result.items.length) {
      return { ...result, items: [] } satisfies LessonsPreviewPage;
    }

    const items = await buildLessonPreviews(result.items);
    return { ...result, items } satisfies LessonsPreviewPage;
  });

export const getLesson = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => fetchLesson(id));

export const getLessonMarkdownHtml = createServerFn({ method: "GET" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data: { id } }) => {
    const lesson = await fetchLesson(id);
    if (!lesson?.markdown) {
      return null;
    }

    return convertMarkdownToHtmlWithShiki(lesson.markdown);
  });

export type { LessonSortBy };
