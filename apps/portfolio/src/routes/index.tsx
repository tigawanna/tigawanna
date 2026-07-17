import { landingLessonPreviewsQueryOptions } from "@/data-access-layer/portfolio/landng-page-query-options";
import { createFileRoute } from "@tanstack/react-router";
import { LandingWebMcpTools } from "./-components/landing/WebMcpLandingTools";
import { LandingFooter } from "./-components/landing/layout/LandingFooter";
import { LandingNavbar } from "./-components/landing/layout/LandingNavbar";
import { LandingHowIWork } from "./-components/landing/sections/about/LandingHowIWork";
import { LandingArticles } from "./-components/landing/sections/articles/LandingArticles";
import { LandingCTA } from "./-components/landing/sections/contact/LandingCTA";
import { LandingFeaturesDeferred } from "./-components/landing/sections/features/LandingFeaturesDeferred";
import { LandingHero } from "./-components/landing/sections/hero/LandingHero";
import { LandingInfodiet } from "./-components/landing/sections/infodiet/LandingInfodiet";
import { LandingLessonsDeferred } from "./-components/landing/sections/lessons/LandingLessonsDeferred";
import { LandingProjectsDeferred } from "./-components/landing/sections/projects/LandingProjectsDeferred";
import { StackCubeDeferred } from "./-components/landing/sections/stack-cube/StackCubeDeferred";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const lessonPreviews = await context.queryClient.ensureQueryData(
      landingLessonPreviewsQueryOptions,
    );

    return lessonPreviews;
  },
  component: LandingPage,
});

function LandingPage() {
  const lessonPreviews = Route.useLoaderData();

  return (
    <div data-test="landing-page" className="min-h-screen">
      <LandingWebMcpTools />
      <LandingNavbar />
      <main id="main-content">
        <LandingHero />
        <StackCubeDeferred />
        <LandingHowIWork />
        <LandingFeaturesDeferred />
        <LandingProjectsDeferred />
        <LandingArticles />
        <LandingInfodiet />
        <LandingLessonsDeferred items={lessonPreviews} />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
