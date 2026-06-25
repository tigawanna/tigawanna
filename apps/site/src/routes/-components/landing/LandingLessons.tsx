import { STATIC_LESSONS } from "@/data/portfolio/static";
import { convertMarkdownToHtml } from "@/lib/markdown/convert";
import type { LessonPreviewItem } from "@/types/lessons";
import { Link } from "@tanstack/react-router";
import { LessonCard } from "./LessonCard";
import { LandingSection, OrganicDivider, SectionEyebrow } from "./LandingPrimitives";

const LESSON_PREVIEW_COUNT = 6;

const lessonPreviews: LessonPreviewItem[] = STATIC_LESSONS.slice(0, LESSON_PREVIEW_COUNT).map(
  (item) => ({
    id: item.id,
    collectionId: item.collectionId,
    collectionName: item.collectionName,
    created: item.created,
    updated: item.updated,
    title: item.title,
    description: item.description,
    type: item.type,
    gist: item.gist,
    previewHtml: item.markdown ? convertMarkdownToHtml(item.markdown) : null,
  }),
);

export function LandingLessons() {
  return (
    <LandingSection
      id="journal"
      tone="panel"
      className="text-base-content"
      dataTest="landing-lessons"
    >
      <OrganicDivider tone="panel" />
      <OrganicDivider tone="panel" flip />

      <div className="container relative z-10">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <SectionEyebrow>Today I learned</SectionEyebrow>
          <h2 className="text-balance font-serif text-5xl leading-none font-semibold tracking-[-0.045em] md:text-7xl">
            Cool things I recently learned.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-base-content/70">
            Small lessons, debugging wins, and notes — stored in Tirso so I can add new ones from
            the admin panel later.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {lessonPreviews.map((item) => (
            <LessonCard key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/lessons"
            search={{}}
            className="inline-flex items-center justify-center rounded-full border border-primary/30 px-6 py-3 text-sm text-primary transition-colors hover:bg-primary/10"
            data-test="lessons-see-more"
          >
            See more lessons
          </Link>
        </div>
      </div>
    </LandingSection>
  );
}
