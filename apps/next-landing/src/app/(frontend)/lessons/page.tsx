import Link from "next/link";
import {
  STATIC_LESSONS,
  toLessonPreviewItem,
} from "@/components/landing/data/static";
import { LandingFooter } from "@/components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { LessonCard } from "@/components/landing/cards/LessonCard";
import { DirectionalPageTransition } from "@/components/view-transitions/DirectionalPageTransition";

/**
 * Lessons index — static fixtures until Payload owns the content.
 */
export default function LessonsIndexPage() {
  const items = STATIC_LESSONS.map(toLessonPreviewItem);

  return (
    <DirectionalPageTransition>
      <div data-test="lessons-index-page" className="min-h-screen bg-base-100 text-base-content">
        <LandingNavbar />
        <main className="min-h-screen px-6 py-28">
          <div className="container mx-auto max-w-6xl">
            <p className="text-center text-xs tracking-[0.28em] text-base-content/50 uppercase">
              Lessons
            </p>
            <h1 className="mt-4 text-center font-serif text-4xl font-medium tracking-[-0.03em] md:text-5xl">
              You code, you learn
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-7 text-base-content/70">
              Small lessons and debugging notes. Full blog styling arrives with Payload.
            </p>

            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item, index) => (
                <LessonCard key={item.id} item={item} tone={(index % 3) as 0 | 1 | 2} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/"
                transitionTypes={["nav-back"]}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Back to landing
              </Link>
            </div>
          </div>
        </main>
        <LandingFooter />
      </div>
    </DirectionalPageTransition>
  );
}
