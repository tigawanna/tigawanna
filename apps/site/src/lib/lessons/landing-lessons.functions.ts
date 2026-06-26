import { createServerFn } from "@tanstack/react-start";
import type { LessonPreviewItem } from "@/types/lessons";

export const LESSON_PREVIEW_COUNT = 6;

export const getLandingLessonPreviews = createServerFn({ method: "GET" }).handler(
  async (): Promise<LessonPreviewItem[]> => {
    const { STATIC_LESSONS } = await import("@/data/portfolio/static");
    const { buildLessonPreviews } = await import("@/lib/lessons/build-lesson-previews");
    return buildLessonPreviews(STATIC_LESSONS.slice(0, LESSON_PREVIEW_COUNT));
  },
);
