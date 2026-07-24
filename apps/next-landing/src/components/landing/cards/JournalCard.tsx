"use client";

import { ViewTransition } from "react";
import { useLandingCardMotion } from "../hooks/use-landing-card-motion";
import type { JournalPreviewItem } from "@/types/journals";
import { journalTitleVtName } from "@/components/view-transitions/names";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { useRef } from "react";
import { twMerge } from "tailwind-merge";

const cardSurfaces = [
  "border-landing-cream/10 bg-landing-panel",
  "border-landing-olive/25 bg-landing-panel-mid",
  "border-landing-cream/8 bg-landing-panel-alt",
] as const;

const previewFades = [
  "from-landing-panel",
  "from-landing-panel-mid",
  "from-landing-panel-alt",
] as const;

interface JournalCardProps {
  item: JournalPreviewItem;
  className?: string;
  tone?: 0 | 1 | 2;
}

/**
 * Landing / index card for a journal entry (blog post or TIL).
 */
export function JournalCard({ item, className, tone = 0 }: JournalCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  useLandingCardMotion(cardRef);

  const href = `/journals/${encodeURIComponent(item.slug)}`;
  const kindLabel = item.kind === "post" ? "Post" : "TIL";
  const cta = item.kind === "post" ? "Read post" : "Read journal";

  return (
    <article
      ref={cardRef}
      data-test="journal-card"
      className={twMerge(
        "landing-card group relative flex flex-col overflow-hidden",
        cardSurfaces[tone],
        className,
      )}
    >
      <Link
        href={href}
        transitionTypes={["nav-forward"]}
        className="flex flex-1 flex-col outline-offset-[-2px]"
        aria-label={`${cta}: ${item.title}`}
      >
        <div className="flex flex-1 flex-col gap-3 p-6 pt-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.65rem] font-semibold tracking-[0.22em] text-landing-olive uppercase">
              {kindLabel}
            </span>
            <time className="text-xs text-landing-sage/60" dateTime={item.created}>
              {item.createdLabel}
            </time>
          </div>

          <ViewTransition name={journalTitleVtName(item.slug)} share="text-morph" default="none">
            <h3 className="line-clamp-2 font-serif text-xl leading-snug text-landing-cream">
              {item.title}
            </h3>
          </ViewTransition>

          <p className="line-clamp-2 text-sm leading-6 text-landing-sage/80">{item.description}</p>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-landing-cream/8 pt-4">
            <span className="inline-flex min-h-6 items-center gap-1 text-xs font-medium text-landing-sage transition-colors group-hover:text-landing-cream">
              {cta}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </span>

            {item.gist ? <span className="size-4" aria-hidden="true" /> : null}
          </div>
        </div>

        {item.previewHtml ? (
          <div className="relative mt-auto block" aria-hidden="true">
            <div
              className="markdown markdown-on-panel max-h-24 overflow-hidden [&_blockquote]:hidden [&_h2]:hidden [&_li]:hidden [&_p]:hidden"
              dangerouslySetInnerHTML={{ __html: item.previewHtml }}
              suppressHydrationWarning
            />
            <div
              className={twMerge(
                "pointer-events-none absolute inset-x-0 bottom-0 flex h-12 items-end justify-center bg-linear-to-t to-transparent pb-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                previewFades[tone],
              )}
              aria-hidden="true"
            >
              <span className="inline-flex items-center gap-1 text-[0.65rem] font-medium text-landing-cream/90">
                {cta}
                <ArrowUpRight className="size-3" />
              </span>
            </div>
            <div
              className={twMerge(
                "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t to-transparent",
                previewFades[tone],
              )}
              aria-hidden="true"
            />
          </div>
        ) : null}
      </Link>

      {item.gist ? (
        <a
          href={item.gist}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-6 bottom-[1.35rem] z-10 inline-flex items-center gap-1 text-xs text-landing-sage/50 transition-colors hover:text-landing-cream"
        >
          Gist
          <ExternalLink className="size-3.5" />
        </a>
      ) : null}
    </article>
  );
}

/** @deprecated Use {@link JournalCard} */
export const LessonCard = JournalCard;
