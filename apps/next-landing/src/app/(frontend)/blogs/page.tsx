import Link from "next/link";
import { getPublishedBlogsPage, BLOGS_PER_PAGE } from "@/data-access/blogs";
import { LandingFooter } from "@/components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { CollectionArchive } from "@/components/blogs/CollectionArchive";
import { BlogsPagination } from "@/components/blogs/BlogsPagination";
import { DirectionalPageTransition } from "@/components/view-transitions/DirectionalPageTransition";

type Args = {
  searchParams: Promise<{ page?: string }>;
};

/**
 * Parses a 1-based page query param, defaulting to 1.
 */
function parsePageParam(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

/**
 * Blogs index — published Payload `blogs` collection.
 */
export default async function BlogsIndexPage({ searchParams }: Args) {
  const params = await searchParams;
  const requestedPage = parsePageParam(params.page);
  const { items, page, totalPages, totalItems } = await getPublishedBlogsPage({
    page: requestedPage,
    perPage: BLOGS_PER_PAGE,
  });

  return (
    <DirectionalPageTransition>
      <div data-test="blogs-index-page" className="min-h-screen bg-base-100 text-base-content">
        <LandingNavbar />
        <main className="min-h-screen px-6 py-28">
          <div className="container mx-auto max-w-6xl">
            <p className="text-center text-xs tracking-[0.28em] text-base-content/50 uppercase">
              Blog
            </p>
            <h1 className="mt-4 text-center font-serif text-4xl font-medium tracking-[-0.03em] md:text-5xl">
              Writing in public
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-7 text-base-content/70">
              Longer posts — published here first, then cross-posted to Dev.to with a canonical URL
              back to this site.
            </p>
            <p className="mt-3 text-center text-xs text-base-content/45">
              {totalItems} {totalItems === 1 ? "post" : "posts"}
              {totalPages > 1 ? ` · page ${page} of ${totalPages}` : null}
            </p>

            {items.length > 0 ? (
              <CollectionArchive items={items} featured={page === 1} />
            ) : (
              <p className="mt-14 text-center text-base text-base-content/60">
                No published posts yet. Import from Dev.to or create one in Payload admin.
              </p>
            )}

            <BlogsPagination page={page} totalPages={totalPages} />

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link
                href="/journals"
                transitionTypes={["nav-forward"]}
                className="text-primary underline-offset-4 hover:underline"
              >
                Browse TILs
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
