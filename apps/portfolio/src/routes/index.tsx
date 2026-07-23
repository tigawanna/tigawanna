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
  component: PortfolioLandingPage,
});

function PortfolioLandingPage() {
  const lessonPreviews = Route.useLoaderData();

  return (
    <>
      <LandingWebMcpTools />
      <LandingPage runtime={createLandingRuntime()} lessonPreviews={lessonPreviews} />
    </>
  );
}
