import { buildLessonPreviews } from "@/modules/lessons/build-lesson-previews";
import { fetchJournalLessonPage } from "@/modules/journal/journal.server";
import { STATIC_LESSONS } from "@/data/portfolio/static";
import { createServerFn } from "@tanstack/react-start";
import type { LessonPreviewItem } from "@/types/lessons";

export const LESSON_PREVIEW_COUNT = 6;

export const getLandingLessonPreviews = createServerFn({ method: "GET" }).handler(
  async (): Promise<LessonPreviewItem[]> => {
    const dbPage = await fetchJournalLessonPage(1, LESSON_PREVIEW_COUNT);
    if (dbPage.items.length > 0) {
      return buildLessonPreviews(dbPage.items);
    }

    return buildLessonPreviews(STATIC_LESSONS.slice(0, LESSON_PREVIEW_COUNT));
  },
);
