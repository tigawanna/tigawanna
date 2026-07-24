import { Suspense } from "react";
import { JournalsIndexContent } from "./_components/JournalsIndexContent";
import { CollectionArchiveSkeleton } from "@/components/blogs/CollectionArchiveSkeleton";

type Args = {
  searchParams: Promise<{ page?: string }>;
};

/**
 * Journals index — `searchParams` is only awaited inside `JournalsIndexContent`,
 * under this Suspense boundary (required by Cache Components).
 */
export default function JournalsIndexPage({ searchParams }: Args) {
  return (
    <Suspense
      fallback={
        <CollectionArchiveSkeleton
          eyebrow="Journals"
          title="Today I learned"
          lead="Short notes and snippets — too brief for a full blog post, worth writing down."
        />
      }
    >
      <JournalsIndexContent searchParams={searchParams} />
    </Suspense>
  );
}
