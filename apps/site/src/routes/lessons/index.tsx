import { lessonsListQueryOptions } from "@/data-access-layer/portfolio/query-options";
import { LandingNavbar } from "@/routes/-components/landing/LandingNavbar";
import { LandingFooter } from "@/routes/-components/landing/LandingFooter";
import { LessonCard } from "@/routes/-components/landing/LessonCard";
import { PortfolioGridSkeleton } from "@/routes/-components/landing/PortfolioGridSkeleton";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { z } from "zod";

const lessonsSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
});

export const Route = createFileRoute("/lessons/")({
  validateSearch: (search) => lessonsSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ context, deps: { page } }) =>
    context.queryClient.ensureQueryData(lessonsListQueryOptions(page, 24)),
  head: () => ({
    meta: [
      { title: "Lessons | Today I Learned" },
      {
        name: "description",
        content:
          "Every bug is a lesson in disguise. Here are the pearls of wisdom gathered along the way.",
      },
    ],
  }),
  component: LessonsPage,
});

function LessonsGrid({ page }: { page: number }) {
  const { data: lessons } = useSuspenseQuery(lessonsListQueryOptions(page, 24));

  return (
    <>
      <ul className="grid w-full gap-5 md:grid-cols-2 xl:grid-cols-3">
        {lessons.items.map((item) => (
          <li key={item.id}>
            <LessonCard item={item} />
          </li>
        ))}
      </ul>

      {lessons.totalPages > 1 ? (
        <nav
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
          data-test="lessons-pagination"
        >
          {page > 1 ? (
            <Link to="/lessons" search={{ page: page - 1 }} className="btn btn-sm btn-outline">
              Previous
            </Link>
          ) : null}
          <span className="text-sm text-base-content/70">
            Page {page} of {lessons.totalPages}
          </span>
          {page < lessons.totalPages ? (
            <Link to="/lessons" search={{ page: page + 1 }} className="btn btn-sm btn-outline">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}

function LessonsPage() {
  const search = Route.useSearch();
  const page = search.page ?? 1;

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

        <Suspense fallback={<PortfolioGridSkeleton count={6} />}>
          <LessonsGrid page={page} />
        </Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}
