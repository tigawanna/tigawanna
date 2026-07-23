import {
  landingLessonPreviewsQueryOptions,
  pinnedReposQueryOptions,
  recentReposQueryOptions,
} from "@/data-access-layer/portfolio/landng-page-query-options";
import { sendContactMessage } from "@/routes/-components/landing/sections/contact/contact.functions";
import {
  LandingArticles,
  LandingCTA,
  LandingFeaturesDeferred,
  LandingFooter,
  LandingHero,
  LandingHowIWork,
  LandingInfodiet,
  LandingLessonsDeferred,
  LandingNavbar,
  LandingProjectsDeferred,
  LandingProvider,
  StackCubeDeferred,
  type LandingRuntime,
} from "@repo/ui/landing";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/gg")({
  loader: async ({ context }) => {
    const lessonPreviews = await context.queryClient.ensureQueryData(
      landingLessonPreviewsQueryOptions,
    );

    return lessonPreviews;
  },
  component: GgLandingPage,
});

/**
 * Demo route that mounts the shared `@repo/ui/landing` package.
 * Mirrors `/` composition while keeping the original app landing untouched.
 */
function GgLandingPage() {
  const lessonPreviews = Route.useLoaderData();

  const runtime: LandingRuntime = {
    pinnedReposQueryOptions: {
      queryKey: pinnedReposQueryOptions.queryKey,
      queryFn: pinnedReposQueryOptions.queryFn,
      staleTime: pinnedReposQueryOptions.staleTime,
    },
    recentReposQueryOptions: {
      queryKey: recentReposQueryOptions.queryKey,
      queryFn: recentReposQueryOptions.queryFn,
      staleTime: recentReposQueryOptions.staleTime,
    },
    sendContactMessage: async (values) => sendContactMessage({ data: values }),
  };

  return (
    <LandingProvider value={runtime}>
      <div data-test="landing-page" className="min-h-screen">
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
    </LandingProvider>
  );
}
