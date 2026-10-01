import { CollectionArchiveSkeleton } from "@/components/blogs/CollectionArchiveSkeleton";

/**
 * Instant navigation shell for the blogs index.
 */
export default function BlogsIndexLoading() {
  return (
    <CollectionArchiveSkeleton
      eyebrow="Blog"
      title="Writing in public"
      lead="A collection of my thoughts on the stuff I build with"
      featured
    />
  );
}
