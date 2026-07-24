import { Suspense, type ReactNode } from "react";
import { getLandingLessonPreviews } from "@/data-access/landing";
import { PortfolioGridSkeleton } from "../../cards/PortfolioGridSkeleton";
import { LandingSection, OrganicDivider, SectionEyebrow } from "../../primitives";
import { LandingLessons } from "./LandingLessons";

function LandingLessonsShell({ children }: { children: ReactNode }) {
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
          <h2 className="landing-section-heading">Cool things I recently learned</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-base-content/70">
            Small lessons, debugging wins, and notes — stored in Tirso so I can add new ones from
            the admin panel later.
          </p>
        </div>
        {children}
      </div>
    </LandingSection>
  );
}

async function LandingLessonsContent() {
  const items = await getLandingLessonPreviews();
  return <LandingLessons items={items} />;
}

/**
 * Lessons section — Suspense shell in the static page; content resolves here
 * via `use cache` so Cache Components can stream without blocking the route.
 */
export function LandingLessonsDeferred() {
  return (
    <Suspense
      fallback={
        <LandingLessonsShell>
          <PortfolioGridSkeleton count={8} />
        </LandingLessonsShell>
      }
    >
      <LandingLessonsContent />
    </Suspense>
  );
}
