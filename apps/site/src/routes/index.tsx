import { SmoothScroll } from "@/components/animation/SmoothScroll";
import { createFileRoute } from "@tanstack/react-router";
import {
  LandingNavbar,
  LandingHero,
  StackCube,
  LandingPeripheralCards,
  LandingFeatures,
  LandingProjects,
  LandingArticles,
  LandingLessons,
  loadLandingLessonPreviews,
  LandingCTA,
  LandingFooter,
} from "./-components/landing";

export const Route = createFileRoute("/")({
  loader: () => loadLandingLessonPreviews(),
  component: LandingPage,
});

function LandingPage() {
  const lessonPreviews = Route.useLoaderData();

  return (
    <div data-test="landing-page" className="min-h-screen">
      <SmoothScroll />
      <LandingNavbar />
      <LandingHero />
      <StackCube />
      <LandingPeripheralCards />
      <LandingFeatures />
      <LandingProjects />
      <LandingArticles />
      <LandingLessons items={lessonPreviews} />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
