import { landingLessonPreviewsQueryOptions } from "@/data-access-layer/portfolio/landng-page-query-options";
import { createLandingRuntime } from "@/lib/landing/create-landing-runtime";
import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@repo/ui/landing";
import { LandingWebMcpTools } from "./-components/landing/WebMcpLandingTools";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const lessonPreviews = await context.queryClient.ensureQueryData(
      landingLessonPreviewsQueryOptions,
    );

    return lessonPreviews;
  },
  component: SiteLandingPage,
});

function SiteLandingPage() {
  const lessonPreviews = Route.useLoaderData();

  return (
    <>
      <LandingWebMcpTools />
      <LandingPage runtime={createLandingRuntime()} lessonPreviews={lessonPreviews} />
    </>
  );
}
