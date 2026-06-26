import { SmoothScroll } from "@/components/animation/SmoothScroll";
import { createFileRoute } from "@tanstack/react-router";
import { LandingFooter } from "./-components/landing/layout/LandingFooter";
import { LandingNavbar } from "./-components/landing/layout/LandingNavbar";
import { LandingHowIWork } from "./-components/landing/sections/about/LandingHowIWork";
import { LandingArticles } from "./-components/landing/sections/articles/LandingArticles";
import { LandingCTA } from "./-components/landing/sections/contact/LandingCTA";
import { LandingFeatures } from "./-components/landing/sections/features/LandingFeatures";
import { LandingHero } from "./-components/landing/sections/hero/LandingHero";
import {
  LandingLessons,
  loadLandingLessonPreviews,
} from "./-components/landing/sections/lessons/LandingLessons";
import { LandingProjects } from "./-components/landing/sections/projects/LandingProjects";
import { StackCube } from "./-components/landing/sections/stack-cube/StackCube";

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
      <LandingHowIWork />
      <LandingFeatures />
      <LandingProjects />
      <LandingArticles />
      <LandingLessons items={lessonPreviews} />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
