import Link from "next/link";
import { getPublishedJournalsPage, JOURNALS_PER_PAGE } from "@/data-access/journals";
import { LandingFooter } from "@/components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { CollectionArchive } from "@/components/blogs/CollectionArchive";
import { JournalsPagination } from "@/components/journals/JournalsPagination";
import { DirectionalPageTransition } from "@/components/view-transitions/DirectionalPageTransition";

type SearchParams = Promise<{ page?: string }>;

/**
 * Parses a 1-based page query param, defaulting to 1.
 */
function parsePageParam(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

/**
 * Awaits `searchParams` — must render under a parent `<Suspense>` (see `page.tsx`).
 */
export async function JournalsIndexContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const requestedPage = parsePageParam(params.page);
  const { items, page, totalPages, totalItems } = await getPublishedJournalsPage({
    page: requestedPage,
    perPage: JOURNALS_PER_PAGE,
  });

  return (
    <DirectionalPageTransition>
      <div data-test="journals-index-page" className="min-h-screen bg-base-100 text-base-content">
        <LandingNavbar />
        <main className="min-h-screen px-6 py-28">
          <div className="container mx-auto max-w-6xl">
            <p className="text-center text-xs tracking-[0.28em] text-base-content/50 uppercase">
              Journals
            </p>
            <h1 className="mt-4 text-center font-serif text-4xl font-medium tracking-[-0.03em] md:text-5xl">
              Today I learned
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-7 text-base-content/70">
              Short notes and snippets — too brief for a full blog post, worth writing down.
            </p>
            <p className="mt-3 text-center text-xs text-base-content/45">
              {totalItems} {totalItems === 1 ? "entry" : "entries"}
              {totalPages > 1 ? ` · page ${page} of ${totalPages}` : null}
            </p>

            <CollectionArchive items={items} />

            <JournalsPagination page={page} totalPages={totalPages} />

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link
                href="/blogs"
                transitionTypes={["nav-forward"]}
                className="text-primary underline-offset-4 hover:underline"
              >
                Browse posts
              </Link>
              <Link
                href="/"
                transitionTypes={["nav-back"]}
                className="text-primary underline-offset-4 hover:underline"
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
