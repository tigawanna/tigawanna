import { Suspense } from "react";
import { RelatedPosts } from "@/components/blogs/RelatedPosts";
import { getRelatedBlogs } from "@/data-access/blogs";
import type { ContentKind } from "@/types/journals";
import { Skeleton } from "@/components/landing/stubs/skeleton";

type RelatedBlogsSectionProps = {
  slug: string;
  kind: ContentKind;
  tags: string[];
  heading: string;
};

/**
 * Skeleton for the related-posts grid while tag-ranked results resolve.
 */
function RelatedPostsSkeleton() {
  return (
    <section className="mt-16 border-t border-base-content/10 pt-12" aria-hidden="true">
      <Skeleton className="h-8 w-48 bg-base-content/10" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-56 w-full bg-base-content/6" />
        ))}
      </div>
    </section>
  );
}

async function RelatedBlogsList({ slug, kind, tags, heading }: RelatedBlogsSectionProps) {
  const related = await getRelatedBlogs({ slug, kind, tags, limit: 3 });
  return <RelatedPosts docs={related} heading={heading} />;
}

/**
 * Streams related posts under Suspense so the article body can paint first.
 */
export function RelatedBlogsSection(props: RelatedBlogsSectionProps) {
  return (
    <Suspense fallback={<RelatedPostsSkeleton />}>
      <RelatedBlogsList {...props} />
    </Suspense>
  );
}
