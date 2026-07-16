import { buildLessonPreviews } from "@/modules/lessons/build-lesson-previews";
import { fetchLesson, fetchLessonsPage } from "@/modules/lessons/lessons.server";
import { convertMarkdownToHtmlWithShiki } from "@/lib/markdown/convert";
import type { LessonsPreviewPage } from "@/types/lessons";
import { createServerFn } from "@tanstack/react-start";

export const getLessons = createServerFn({ method: "GET" })
  .validator((input: { page?: number; perPage?: number }) => input)
  .handler(async ({ data: { page = 1, perPage = 6 } }) => fetchLessonsPage(page, perPage));

export const getLessonsPreview = createServerFn({ method: "GET" })
  .validator((input: { page?: number; perPage?: number }) => input)
  .handler(async ({ data: { page = 1, perPage = 6 } }) => {
    const result = await fetchLessonsPage(page, perPage);
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
