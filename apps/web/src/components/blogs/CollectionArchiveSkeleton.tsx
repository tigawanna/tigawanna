import { LandingFooter } from "@/components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { Skeleton } from "@/components/landing/stubs/skeleton";

type CollectionArchiveSkeletonProps = {
  eyebrow: string;
  title: string;
  lead: string;
  featured?: boolean;
};

/**
 * Index loading shell for `/blogs` and `/journals`.
 */
export function CollectionArchiveSkeleton({
  eyebrow,
  title,
  lead,
  featured = false,
}: CollectionArchiveSkeletonProps) {
  return (
    <div
      data-test="collection-archive-skeleton"
      className="min-h-screen bg-base-100 text-base-content"
      aria-busy="true"
    >
      <LandingNavbar />
      <main className="min-h-screen px-6 py-28">
        <div className="container mx-auto max-w-6xl">
          <p className="text-center text-xs tracking-[0.28em] text-base-content/50 uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-center font-serif text-4xl font-medium tracking-[-0.03em] md:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-7 text-base-content/70">
            {lead}
          </p>
          <Skeleton className="mx-auto mt-3 h-3 w-40 bg-base-content/8" />

          <div className="mt-14">
            {featured ? <Skeleton className="mb-5 h-72 w-full bg-base-content/6 md:h-80" /> : null}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: featured ? 6 : 8 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full bg-base-content/6" />
              ))}
            </div>
          </div>
          <span className="sr-only">Loading…</span>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
