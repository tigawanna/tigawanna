import { JournalCard } from "@/components/landing/cards/JournalCard";
import type { JournalPreviewItem } from "@/types/journals";
import { cn } from "@/lib/cn";

type CollectionArchiveProps = {
  items: JournalPreviewItem[];
  className?: string;
  /** Prefer a featured lead card on the first item (posts with covers). */
  featured?: boolean;
};

/**
 * Archive grid — adapted from Payload website template `CollectionArchive`.
 */
export function CollectionArchive({
  items,
  className,
  featured = false,
}: CollectionArchiveProps) {
  if (items.length === 0) return null;

  const [lead, ...rest] = featured && items[0]?.heroImageUrl ? items : [null, ...items];
  const gridItems = lead ? rest : items;

  return (
    <div data-test="collection-archive" className={cn("mt-14", className)}>
      {lead ? (
        <div className="mb-5">
          <JournalCard item={lead} tone={0} featured />
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {gridItems.map((item, index) => (
          <JournalCard
            key={item.id}
            item={item}
            tone={((lead ? index + 1 : index) % 3) as 0 | 1 | 2}
          />
        ))}
      </div>
    </div>
  );
}
