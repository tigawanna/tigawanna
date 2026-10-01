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
          lead="A collection of my thoughts on the stuff I build with."
          featured
        />
      }
    >
      <BlogsIndexContent searchParams={searchParams} />
    </Suspense>
  );
}
