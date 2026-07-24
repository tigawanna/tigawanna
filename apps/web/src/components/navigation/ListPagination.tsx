import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

type PageItem = number | "ellipsis";

/**
 * Builds a compact page list with ellipses for jumping across large ranges.
 *
 * @example buildPageItems(5, 12) → [1, 'ellipsis', 4, 5, 6, 'ellipsis', 12]
 */
function buildPageItems(current: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: PageItem[] = [1];
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(totalPages - 1, current + 1);

  if (windowStart > 2) items.push("ellipsis");
  for (let page = windowStart; page <= windowEnd; page += 1) {
    items.push(page);
  }
  if (windowEnd < totalPages - 1) items.push("ellipsis");
  items.push(totalPages);

  return items;
}

/**
 * Builds an index href for a 1-based page under a base path.
 */
function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

interface ListPaginationProps {
  page: number;
  totalPages: number;
  /** Path without query, e.g. `/blogs` or `/journals`. */
  basePath: string;
  /** Accessible name for the nav landmark. */
  label: string;
  className?: string;
  "data-test"?: string;
}

/**
 * Server-rendered list pagination with prev/next and direct page jumps.
 */
export function ListPagination({
  page,
  totalPages,
  basePath,
  label,
  className,
  "data-test": dataTest = "list-pagination",
}: ListPaginationProps) {
  if (totalPages <= 1) return null;

  const current = Math.min(Math.max(1, page), totalPages);
  const items = buildPageItems(current, totalPages);

  return (
    <nav
      aria-label={label}
      data-test={dataTest}
      className={cn("mt-12 flex flex-col items-center gap-4", className)}
    >
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>
          {current > 1 ? (
            <Link
              href={pageHref(basePath, current - 1)}
              className="inline-flex size-10 items-center justify-center rounded-lg border border-base-content/10 text-base-content/70 transition-colors hover:border-base-content/25 hover:text-base-content"
              aria-label="Previous page"
              rel="prev"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <span
              className="inline-flex size-10 items-center justify-center rounded-lg border border-base-content/5 text-base-content/25"
              aria-disabled="true"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </span>
          )}
        </li>

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <li
              key={`ellipsis-${index}`}
              className="inline-flex size-10 items-center justify-center text-base-content/40"
              aria-hidden="true"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={pageHref(basePath, item)}
                aria-label={`Page ${item}`}
                aria-current={item === current ? "page" : undefined}
                className={cn(
                  "inline-flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                  item === current
                    ? "bg-primary text-primary-content"
                    : "border border-base-content/10 text-base-content/70 hover:border-base-content/25 hover:text-base-content",
                )}
              >
                {item}
              </Link>
            </li>
          ),
        )}

        <li>
          {current < totalPages ? (
            <Link
              href={pageHref(basePath, current + 1)}
              className="inline-flex size-10 items-center justify-center rounded-lg border border-base-content/10 text-base-content/70 transition-colors hover:border-base-content/25 hover:text-base-content"
              aria-label="Next page"
              rel="next"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <span
              className="inline-flex size-10 items-center justify-center rounded-lg border border-base-content/5 text-base-content/25"
              aria-disabled="true"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </span>
          )}
        </li>
      </ul>

      <p className="text-xs tracking-wide text-base-content/45">
        Page {current} of {totalPages}
      </p>
    </nav>
  );
}
