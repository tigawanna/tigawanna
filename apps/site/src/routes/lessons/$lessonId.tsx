import {
  lessonHtmlQueryOptions,
  lessonQueryOptions,
} from "@/data-access-layer/portfolio/landng-page-query-options";
import { LessonAdminEditButton } from "@/routes/lessons/-components/LessonAdminEditButton";
import { buildLessonDetailSeoHead } from "@/utils/lesson-seo";
import { LandingFooter, LandingNavbar } from "@repo/ui/landing";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { CalendarRange, ExternalLink } from "lucide-react";
import { Suspense } from "react";

export const Route = createFileRoute("/lessons/$lessonId")({
  loader: async ({ context, params }) => {
    try {
      const lesson = await context.queryClient.ensureQueryData(lessonQueryOptions(params.lessonId));
      await context.queryClient.ensureQueryData(lessonHtmlQueryOptions(params.lessonId));
      return { lesson };
    } catch {
      throw redirect({ to: "/lessons", search: {} });
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData?.lesson) {
      return { meta: [{ title: "Lesson | Today I Learned" }] };
    }
    return buildLessonDetailSeoHead(loaderData.lesson);
  },
  component: LessonDetailPage,
});

function LessonDetailContent({ lessonId }: { lessonId: string }) {
  const { data: lesson } = useSuspenseQuery(lessonQueryOptions(lessonId));
  const { data: html } = useSuspenseQuery(lessonHtmlQueryOptions(lessonId));

  const formattedDate = new Date(lesson.created).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="mx-auto max-w-4xl h-ful min-h-screen" data-test="lesson-detail">
      <div className="mb-8 flex items-center justify-between gap-3">
        <Link
          to="/lessons"
          search={{}}
          className="inline-flex text-sm text-primary hover:underline"
        >
          Back to lessons
        </Link>
        <LessonAdminEditButton lessonId={lessonId} />
      </div>

      <h1 className="text-balance text-center font-serif text-5xl font-semibold tracking-[-0.04em] md:text-6xl">
        {lesson.title}
      </h1>
      <p className="mx-auto mt-4 max-w-3xl text-center text-lg leading-8 text-base-content/70">
        {lesson.description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-base-content/70">
        <div className="flex items-center gap-2">
          <CalendarRange className="size-4" />
          {formattedDate}
        </div>
        {lesson.gist ? (
          <a
            href={lesson.gist}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Gist
            <ExternalLink className="size-4" />
          </a>
        ) : null}
      </div>

      {html ? (
        <div
          className="markdown markdown-lesson mt-10"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}
    </article>
  );
}

function LessonDetailPage() {
  const { lessonId } = Route.useParams();

  return (
    <div data-test="lesson-detail-page" className="min-h-screen bg-base-100 text-base-content">
      <LandingNavbar />
      <main className="min-h-screen py-24">
        <Suspense
          fallback={
            <div className="mx-auto max-w-4xl animate-pulse space-y-4">
              <div className="h-10 rounded bg-base-300" />
              <div className="h-40 rounded bg-base-300" />
            </div>
          }
        >
          <LessonDetailContent lessonId={lessonId} />
        </Suspense>
      </main>
      <LandingFooter />
    </div>
  );
}
