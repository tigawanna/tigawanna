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
          <header
            className={
              showCover ? "relative flex min-h-[min(56vh,32rem)] items-end" : "relative pt-8"
            }
          >
            {showCover ? (
              <div
                className="pointer-events-none absolute inset-0 -z-10 animate-pulse bg-base-200/80"
                aria-hidden="true"
              />
            ) : null}
            <div className="container relative z-10 w-full pb-10">
              <div className="mx-auto max-w-3xl">
                <p className="mb-8 text-sm text-base-content/40">{backLabel}</p>
                <Skeleton className="mb-4 h-3 w-40 bg-base-content/10" />
                <Skeleton className="h-12 w-[min(100%,28rem)] bg-base-content/12 md:h-14" />
                <Skeleton className="mt-3 h-10 w-[min(100%,22rem)] bg-base-content/10 md:h-12" />
                <Skeleton className="mt-6 h-5 w-full max-w-xl bg-base-content/8" />
                <Skeleton className="mt-2 h-5 w-4/5 max-w-lg bg-base-content/8" />
                <div className="mt-8 flex gap-10">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 bg-base-content/8" />
                    <Skeleton className="h-4 w-32 bg-base-content/10" />
                  </div>
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
