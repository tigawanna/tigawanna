import { getLesson, getLessonMarkdownHtml } from "@/lib/lessons/lessons";
import { LandingFooter } from "@/routes/-components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/routes/-components/landing/layout/LandingNavbar";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { CalendarRange, ExternalLink } from "lucide-react";
import { Suspense } from "react";

const lessonQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["lessons", "detail", id],
    queryFn: async () => {
      const lesson = await getLesson({ data: { id } });
      if (!lesson) {
        throw new Error("Lesson not found");
      }
      return lesson;
    },
  });

const lessonHtmlQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["lessons", "html", id],
    queryFn: () => getLessonMarkdownHtml({ data: { id } }),
  });

export const Route = createFileRoute("/lessons/$lessonId")({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(lessonQueryOptions(params.lessonId));
      await context.queryClient.ensureQueryData(lessonHtmlQueryOptions(params.lessonId));
    } catch {
      throw redirect({ to: "/lessons", search: {} });
    }
  },
  head: () => ({
    meta: [{ title: "Lesson | Today I Learned" }],
  }),
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
    <article className="mx-auto max-w-4xl" data-test="lesson-detail">
      <Link
        to="/lessons"
        search={{}}
        className="mb-8 inline-flex text-sm text-primary hover:underline"
      >
        Back to lessons
      </Link>

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
          className="markdown markdown-lesson mt-10 [&_pre:has(>code.hljs)]:overflow-x-auto [&_pre_code.hljs]:rounded-xl [&_pre_code.hljs]:text-sm"
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
      <main className="container py-24">
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
