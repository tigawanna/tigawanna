import Link from "next/link";

/**
 * Placeholder lesson detail — Payload blog posts will replace this later.
 */
export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;

  return (
    <main className="landing-void-surface mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 py-24 text-landing-sage">
      <p className="text-xs tracking-[0.28em] text-landing-sage/50 uppercase">Lesson</p>
      <h1 className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em]">{lessonId}</h1>
      <p className="mt-4 text-sm leading-7 text-landing-sage/70">
        Detail rendering is intentionally stubbed for the performance experiment.
      </p>
      <Link
        href="/lessons"
        className="mt-8 text-sm text-landing-cream underline-offset-4 hover:underline"
      >
        All lessons
      </Link>
    </main>
  );
}
