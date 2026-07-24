import { Suspense, ViewTransition } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarRange, ExternalLink } from "lucide-react";
import { getStaticLessonById } from "@/components/landing/data/static";
import { LandingFooter } from "@/components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { DirectionalPageTransition } from "@/components/view-transitions/DirectionalPageTransition";
import { lessonTitleVtName } from "@/components/view-transitions/names";

async function LessonDetail({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = getStaticLessonById(decodeURIComponent(lessonId));
  if (!lesson) notFound();

  const formattedDate = new Date(lesson.created).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ViewTransition enter="slide-up" default="none">
      <div data-test="lesson-detail-page" className="min-h-screen bg-base-100 text-base-content">
        <LandingNavbar />
        <main className="min-h-screen py-24">
          <article className="mx-auto max-w-4xl px-6" data-test="lesson-detail">
            <div className="mb-8">
              <Link
                href="/lessons"
                transitionTypes={["nav-back"]}
                className="inline-flex text-sm text-primary hover:underline"
              >
                Back to lessons
              </Link>
            </div>

            <ViewTransition name={lessonTitleVtName(lesson.id)} share="text-morph" default="none">
              <h1 className="text-balance text-center font-serif text-5xl font-semibold tracking-[-0.04em] md:text-6xl">
                {lesson.title}
              </h1>
            </ViewTransition>
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

            {/* Markdown body styling lands with Payload/blog — keep raw text readable for now. */}
            {lesson.markdown ? (
              <pre className="mt-10 overflow-x-auto whitespace-pre-wrap rounded-lg border border-base-content/10 bg-base-200/40 p-6 font-sans text-sm leading-7 text-base-content/80">
                {lesson.markdown}
              </pre>
            ) : null}
          </article>
        </main>
        <LandingFooter />
      </div>
    </ViewTransition>
  );
}

/**
 * Lesson detail scaffold — enough for landing e2e (title + description).
 * Rich HTML styling comes later with Payload Lexical markup.
 */
export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  return (
    <DirectionalPageTransition>
      <Suspense
        fallback={
          <ViewTransition exit="slide-down" default="none">
            <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 py-24">
              <p className="text-sm text-base-content/60">Loading lesson…</p>
            </main>
          </ViewTransition>
        }
      >
        <LessonDetail params={params} />
      </Suspense>
    </DirectionalPageTransition>
  );
}
