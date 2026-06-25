import { lessonsPreviewQueryOptions } from "@/data-access-layer/portfolio/query-options";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { LessonCard } from "./LessonCard";
import { LandingSection, OrganicDivider, ScrollReveal, SectionEyebrow } from "./LandingPrimitives";
import { PortfolioGridSkeleton } from "./PortfolioGridSkeleton";

function LessonsContent() {
  const { data: lessons } = useSuspenseQuery(lessonsPreviewQueryOptions);

  if (!lessons.items.length) {
    return (
      <p className="rounded-[2rem] border border-base-content/10 bg-base-300/60 p-8 text-center text-base-content/70">
        No TIL snippets yet. Configure PB_URL to load journal entries from PocketBase.
      </p>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {lessons.items.map((item) => (
        <LessonCard key={item.id} item={item} />
      ))}
    </div>
  );
}

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
        <ScrollReveal className="mx-auto mb-14 max-w-3xl text-center">
          <SectionEyebrow>Today I learned</SectionEyebrow>
          <h2 className="text-balance font-serif text-5xl leading-none font-semibold tracking-[-0.045em] md:text-7xl">
            Cool things I recently learned.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-base-content/70">
            Small lessons, debugging wins, and notes rendered on the server so markdown stays off
            the wire.
          </p>
        </ScrollReveal>

        <Suspense fallback={<PortfolioGridSkeleton count={6} />}>
          <LessonsContent />
        </Suspense>

        <ScrollReveal delay="short" className="mt-10 text-center">
          <Link
            to="/lessons"
            search={{}}
            className="inline-flex items-center justify-center rounded-full border border-primary/30 px-6 py-3 text-sm text-primary transition-colors hover:bg-primary/10"
            data-test="lessons-see-more"
          >
            See more lessons
          </Link>
        </ScrollReveal>
      </div>
    </LandingSection>
  );
}
