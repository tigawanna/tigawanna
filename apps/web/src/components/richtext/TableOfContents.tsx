import { ListTree } from "lucide-react";
import type { TocItem } from "./prepare-article-content";
import { cn } from "@/lib/cn";

type TableOfContentsProps = {
  items: TocItem[];
  className?: string;
};

/**
 * In-article contents nav built from h2–h4 headings (replaces bland imported TOC lists).
 */
export function TableOfContents({ items, className }: TableOfContentsProps) {
  if (items.length === 0) return null;

  const minDepth = Math.min(...items.map((item) => item.depth));

  return (
    <nav
      data-test="article-toc"
      aria-labelledby="article-toc-heading"
      className={cn(
        "not-prose my-8 overflow-hidden rounded-2xl border border-base-content/10 bg-base-200/35",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-base-content/8 px-5 py-3.5">
        <ListTree className="size-4 text-primary" aria-hidden="true" />
        <h2
          id="article-toc-heading"
          className="m-0! font-sans text-[0.7rem] font-semibold tracking-[0.2em] text-base-content/70 uppercase"
        >
          Contents
        </h2>
      </div>

      <ol className="m-0 list-none space-y-0.5 px-2 py-2 sm:px-3 sm:py-2.5">
        {items.map((item, index) => {
          const indent = item.depth - minDepth;
          const number = String(index + 1).padStart(2, "0");

          return (
            <li key={item.id} className="m-0">
              <a
                href={`#${item.id}`}
                className={cn(
                  "group flex items-baseline gap-3 rounded-xl px-3 py-2 text-base-content/70 no-underline transition-colors",
                  "hover:bg-base-100/55 hover:text-base-content",
                  indent === 1 && "pl-7",
                  indent >= 2 && "pl-11",
                )}
              >
                <span className="w-6 shrink-0 font-mono text-[0.7rem] tracking-wide text-base-content/35 group-hover:text-primary/80">
                  {number}
                </span>
                <span
                  className={cn(
                    "text-pretty text-sm leading-snug sm:text-[0.95rem]",
                    item.depth === 2 && "font-medium text-base-content/85",
                  )}
                >
                  {item.title}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
