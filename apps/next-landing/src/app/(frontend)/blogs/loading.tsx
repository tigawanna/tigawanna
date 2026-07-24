import { CollectionArchiveSkeleton } from "@/components/blogs/CollectionArchiveSkeleton";

/**
 * Instant navigation shell for the blogs index.
 */
export default function BlogsIndexLoading() {
  return (
    <CollectionArchiveSkeleton
      eyebrow="Blog"
      title="Writing in public"
      lead="Longer posts — published here first, then cross-posted to Dev.to with a canonical URL back to this site."
      featured
    />
  );
}
