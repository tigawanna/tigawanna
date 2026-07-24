import { JournalCard } from "@/components/landing/cards/JournalCard";
import type { JournalPreviewItem } from "@/types/journals";
import { cn } from "@/lib/cn";

type RelatedPostsProps = {
  docs: JournalPreviewItem[];
  className?: string;
  heading?: string;
};

/**
 * Related posts grid — adapted from Payload website template `RelatedPosts`.
 */
export function RelatedPosts({ docs, className, heading = "Related writing" }: RelatedPostsProps) {
  if (docs.length === 0) return null;

  return (
    <section
      data-test="related-posts"
      className={cn("mt-16 border-t border-base-content/10 pt-12", className)}
      aria-labelledby="related-posts-heading"
    >
      <h2
        id="related-posts-heading"
        className="font-serif text-2xl font-semibold tracking-[-0.03em] md:text-3xl"
      >
        {heading}
      </h2>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc, index) => (
          <JournalCard key={doc.id} item={doc} tone={(index % 3) as 0 | 1 | 2} />
        ))}
      </div>
    </section>
  );
}
