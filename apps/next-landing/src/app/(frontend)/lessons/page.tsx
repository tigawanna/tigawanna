import Link from "next/link";

/**
 * Placeholder lessons index — full lesson/blog UI comes after Payload content is wired.
 */
export default function LessonsIndexPage() {
  return (
    <main className="landing-void-surface mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 py-24 text-landing-sage">
      <p className="text-xs tracking-[0.28em] text-landing-sage/50 uppercase">Lessons</p>
      <h1 className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em]">Coming soon</h1>
      <p className="mt-4 text-sm leading-7 text-landing-sage/70">
        Lesson detail pages will move here once the Next.js landing experiment proves out and
        Payload CMS owns the content.
      </p>
      <Link href="/" className="mt-8 text-sm text-landing-cream underline-offset-4 hover:underline">
        Back to landing
      </Link>
    </main>
  );
}
