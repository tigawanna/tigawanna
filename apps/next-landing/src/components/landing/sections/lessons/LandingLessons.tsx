import type { LessonPreviewItem } from "../../types/lessons";
import Link from "next/link";
import { LessonCard } from "../../cards/LessonCard";

interface LandingLessonsProps {
  items: LessonPreviewItem[];
}

/**
 * Lessons grid + see-more — section chrome lives in `LandingLessonsDeferred`.
 */
export function LandingLessons({ items }: LandingLessonsProps) {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item, index) => (
          <LessonCard key={item.id} item={item} tone={(index % 3) as 0 | 1 | 2} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/lessons"
          transitionTypes={["nav-forward"]}
          className="inline-flex items-center justify-center rounded-full border border-primary/30 px-6 py-3 text-sm text-primary transition-colors hover:bg-primary/10"
          data-test="lessons-see-more"
        >
          See more lessons
        </Link>
      </div>
    </>
  );
}
