import { landingLessonPreviewsQueryOptions } from "@/data-access-layer/portfolio/landng-page-query-options";
import { createLandingRuntime } from "@/lib/landing/create-landing-runtime";
import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@repo/ui/landing";

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
 * Alias of `/` that mounts the shared `@repo/ui/landing` package.
 * Kept for e2e (`LANDING_PATH=/gg`) while `/` uses the same composition.
 */
function GgLandingPage() {
  const lessonPreviews = Route.useLoaderData();

  return <LandingPage runtime={createLandingRuntime()} lessonPreviews={lessonPreviews} />;
}
