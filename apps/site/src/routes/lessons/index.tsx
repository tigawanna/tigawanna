import {
  LESSONS_LIST_PER_PAGE,
  lessonsListQueryOptions,
} from "@/data-access-layer/portfolio/landng-page-query-options";
import { LandingFooter } from "@/routes/-components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/routes/-components/landing/layout/LandingNavbar";
import { buildLessonsIndexSeoHead } from "@/utils/lesson-seo";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { LessonsList } from "./-components/LessonsList";

const lessonsSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  q: z.string().optional(),
  sortBy: z.enum(["latest", "oldest"]).optional(),
  /** URL uses "true" only when checked — omit means time-only sort. */
  pinnedFirst: z.literal("true").optional(),
});

export const Route = createFileRoute("/lessons/")({
  validateSearch: (search) => lessonsSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({
    page: search.page ?? 1,
    q: search.q ?? "",
    sortBy: search.sortBy ?? "latest",
    pinnedFirst: search.pinnedFirst === "true",
  }),
  loader: ({ context, deps: { page, q, sortBy, pinnedFirst } }) =>
    context.queryClient.ensureQueryData(
      lessonsListQueryOptions({
        page,
        perPage: LESSONS_LIST_PER_PAGE,
        q,
        sortBy,
        pinnedFirst,
      }),
    ),
  head: () => buildLessonsIndexSeoHead(),
  component: LessonsPage,
});

function LessonsPage() {
  return (
    <div data-test="lessons-page" className="min-h-screen bg-base-100 text-base-content">
      <LandingNavbar />
      <main className="container py-24">
        <header className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="font-serif text-5xl font-semibold tracking-[-0.04em] md:text-6xl">
            You code, you learn
          </h1>
          <p className="mt-4 text-lg leading-8 text-base-content/70">
            Every bug is a lesson in disguise. Here are the pearls of wisdom gathered along the way.
          </p>
        </header>

        <LessonsList />
      </main>
      <LandingFooter />
    </div>
  );
}
