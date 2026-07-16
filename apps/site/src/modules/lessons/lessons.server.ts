import { getStaticLessonById, STATIC_LESSONS } from "@/data/portfolio/static";
import { fetchJournalLessonById, fetchJournalLessonPage } from "@/modules/journal/journal.server";
import type { LessonItem, LessonsPage } from "@/types/lessons";

export async function fetchLessonsPage(page: number, perPage: number): Promise<LessonsPage> {
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

export async function fetchLesson(id: string): Promise<LessonItem | null> {
  const fromDb = await fetchJournalLessonById(id);
  if (fromDb) {
    return fromDb;
  }

  return getStaticLessonById(id);
}
