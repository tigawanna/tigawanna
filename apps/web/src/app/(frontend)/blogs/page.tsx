import { Suspense } from "react";
import { BlogsIndexContent } from "./_components/BlogsIndexContent";
import { CollectionArchiveSkeleton } from "@/components/blogs/CollectionArchiveSkeleton";

type Args = {
  searchParams: Promise<{ page?: string }>;
};

/**
 * Blogs index — `searchParams` is only awaited inside `BlogsIndexContent`,
 * under this Suspense boundary (required by Cache Components).
 */
export default function BlogsIndexPage({ searchParams }: Args) {
  return (
    <Suspense
      fallback={
        <CollectionArchiveSkeleton
          eyebrow="Blog"
          title="Writing in public"
          lead="Longer posts — published here first, then cross-posted to Dev.to with a canonical URL back to this site."
          featured
        />
      }
    >
      <BlogsIndexContent searchParams={searchParams} />
    </Suspense>
  );
}
