import { Suspense } from "react";
import { CenteredLoader } from "@/components/loading/CenteredLoader";
import { RelatedPosts } from "@/components/blogs/RelatedPosts";
import { getRelatedBlogs } from "@/data-access/blogs";
import type { ContentKind } from "@/types/journals";

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
      <CenteredLoader label="Loading related posts…" size="sm" className="min-h-40 py-10" />
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
