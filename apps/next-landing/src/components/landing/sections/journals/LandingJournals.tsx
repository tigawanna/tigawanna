import type { JournalPreviewItem } from "@/types/journals";
import Link from "next/link";
import { JournalCard } from "../../cards/JournalCard";

interface LandingJournalsProps {
  items: JournalPreviewItem[];
}

/**
 * Journals grid + see-more — section chrome lives in `LandingJournalsDeferred`.
 */
export function LandingJournals({ items }: LandingJournalsProps) {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item, index) => (
          <JournalCard key={item.id} item={item} tone={(index % 3) as 0 | 1 | 2} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/journals"
          transitionTypes={["nav-forward"]}
          className="inline-flex items-center justify-center rounded-full border border-primary/30 px-6 py-3 text-sm text-primary transition-colors hover:bg-primary/10"
          data-test="journals-see-more"
        >
          See more journals
        </Link>
      </div>
    </>
  );
}
