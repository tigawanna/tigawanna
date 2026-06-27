import { getStaticLessonById, STATIC_LESSONS } from "@/data/portfolio/static";
import { buildLessonPreviews } from "@/modules/lessons/build-lesson-previews";
import {
  fetchJournalLessonById,
  fetchJournalLessonPage,
} from "@/modules/journal/journal.functions";
import { convertMarkdownToHtmlWithShiki } from "@/lib/markdown/convert";
import type { LessonItem, LessonsPage, LessonsPreviewPage } from "@/types/lessons";
import { createServerFn } from "@tanstack/react-start";

async function fetchLessonsPage(page: number, perPage: number): Promise<LessonsPage> {
  const dbPage = await fetchJournalLessonPage(page, perPage);
  if (dbPage.totalItems > 0) {
    return dbPage;
  }

  const totalItems = STATIC_LESSONS.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * perPage;

  return {
    page: safePage,
    perPage,
    totalPages,
    totalItems,
    items: STATIC_LESSONS.slice(start, start + perPage),
  };
}

async function fetchLesson(id: string): Promise<LessonItem | null> {
  const fromDb = await fetchJournalLessonById(id);
  if (fromDb) {
    return fromDb;
  }

  return getStaticLessonById(id);
}

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
