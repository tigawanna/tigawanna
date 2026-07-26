import { LandingFooter } from "@/components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { Skeleton } from "@/components/landing/stubs/skeleton";

type ContentArticleSkeletonProps = {
  backLabel: string;
  /** Show a tall cover placeholder (blog posts usually have one). */
  showCover?: boolean;
};

/**
 * Article loading shell that mirrors PostHero + body so navigations don't flash
 * a blank "Loading…" screen.
 */
export function ContentArticleSkeleton({
  backLabel,
  showCover = true,
}: ContentArticleSkeletonProps) {
  return (
    <div
      data-test="content-article-skeleton"
      className="min-h-screen bg-base-100 text-base-content"
      aria-busy="true"
      aria-live="polite"
    >
      <LandingNavbar />
      <main className="min-h-screen pt-20 pb-24">
        <article>
          <header className="relative">
            {showCover ? (
              <div
                className="aspect-21/9 w-full min-h-52 animate-pulse bg-base-200/80 sm:min-h-64 md:aspect-3/1 md:min-h-72"
                aria-hidden="true"
              />
            ) : null}
            <div className={showCover ? "container pt-10 pb-4" : "container pt-8 pb-4"}>
              <div className="mx-auto max-w-3xl">
                <Skeleton className="mb-4 h-3 w-40 bg-base-content/10" />
                <Skeleton className="h-12 w-[min(100%,28rem)] bg-base-content/12 md:h-14" />
                <Skeleton className="mt-3 h-10 w-[min(100%,22rem)] bg-base-content/10 md:h-12" />
                <Skeleton className="mt-6 h-5 w-full max-w-xl bg-base-content/8" />
                <Skeleton className="mt-2 h-5 w-4/5 max-w-lg bg-base-content/8" />
                <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 bg-base-content/8" />
                    <Skeleton className="h-4 w-32 bg-base-content/10" />
                  </div>
                  <p className="btn btn-ghost btn-sm pointer-events-none w-fit gap-2 rounded-full border border-base-content/10 px-4 font-normal text-base-content/40">
                    {backLabel}
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div className="container pt-10">
            <div className="mx-auto max-w-3xl space-y-4">
              <Skeleton className="h-4 w-full bg-base-content/8" />
              <Skeleton className="h-4 w-[96%] bg-base-content/8" />
              <Skeleton className="h-4 w-[92%] bg-base-content/8" />
              <Skeleton className="mt-6 h-4 w-full bg-base-content/8" />
              <Skeleton className="h-4 w-[94%] bg-base-content/8" />
              <Skeleton className="h-4 w-[88%] bg-base-content/8" />
              <Skeleton className="mt-8 h-48 w-full rounded-xl bg-base-content/6" />
              <Skeleton className="mt-6 h-4 w-full bg-base-content/8" />
              <Skeleton className="h-4 w-[90%] bg-base-content/8" />
              <Skeleton className="h-4 w-[85%] bg-base-content/8" />
              <span className="sr-only">Loading article…</span>
            </div>
          </div>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
