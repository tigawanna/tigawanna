import { getStaticLessonById, STATIC_LESSONS } from "@/data/portfolio/static";
import {
  countJournalEntries,
  fetchJournalLessonById,
  fetchJournalLessonPage,
  type FetchJournalLessonPageOptions,
  type LessonSortBy,
} from "@/modules/journal/journal.server";
import type { LessonItem, LessonsPage } from "@/types/lessons";

/**
 * Filters and sorts static lesson fixtures when the DB has no journal rows.
 *
 * @param lessons - Static lesson fixtures.
 * @param options - Optional search and sort (`latest` default).
 */
function filterAndSortStaticLessons(
  lessons: LessonItem[],
  options: FetchJournalLessonPageOptions,
): LessonItem[] {
  const q = options.q?.trim().toLowerCase() ?? "";
  let filtered = lessons;
  if (q) {
    filtered = lessons.filter((lesson) => {
      const haystack = `${lesson.title} ${lesson.description}`.toLowerCase();
      return haystack.includes(q);
    });
  }

  return [...filtered].sort((a, b) => {
    const delta = new Date(a.created).getTime() - new Date(b.created).getTime();
    if (options.sortBy === "oldest") {
      return delta;
    }
    return -delta;
  });
}

/**
 * Fetches a paginated lessons page from D1, falling back to static fixtures.
 *
 * @param page - 1-based page index.
 * @param perPage - Page size.
 * @param options - Optional search and sort (`latest` default).
 */
export async function fetchLessonsPage(
  page: number,
  perPage: number,
  options: FetchJournalLessonPageOptions = {},
): Promise<LessonsPage> {
  const dbTotal = await countJournalEntries();
  if (dbTotal > 0) {
    return fetchJournalLessonPage(page, perPage, options);
  }

  const filtered = filterAndSortStaticLessons(STATIC_LESSONS, options);
  const totalItems = filtered.length;
  let totalPages = 0;
  if (totalItems > 0) {
    totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  }
  let safePage = 1;
  if (totalPages > 0) {
    safePage = Math.min(Math.max(page, 1), totalPages);
  }
  const start = (safePage - 1) * perPage;

  return {
    page: safePage,
    perPage,
    totalPages,
    totalItems,
    items: filtered.slice(start, start + perPage),
  };
}

export async function fetchLesson(id: string): Promise<LessonItem | null> {
  const fromDb = await fetchJournalLessonById(id);
  if (fromDb) {
    return fromDb;
  }

  return getStaticLessonById(id);
}

export type { LessonSortBy };
