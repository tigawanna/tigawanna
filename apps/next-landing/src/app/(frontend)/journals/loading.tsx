import { CollectionArchiveSkeleton } from "@/components/blogs/CollectionArchiveSkeleton";

/**
 * Instant navigation shell for the journals index.
 */
export default function JournalsIndexLoading() {
  return (
    <CollectionArchiveSkeleton
      eyebrow="Journals"
      title="Today I learned"
      lead="Short notes and snippets — too brief for a full blog post, worth writing down."
    />
  );
}
