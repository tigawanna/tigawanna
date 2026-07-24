"use client";

import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useLandingCardMotion } from "../hooks/use-landing-card-motion";
import type { JournalPreviewItem } from "@/types/journals";
import { journalTitleVtName } from "@/components/view-transitions/names";

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
  /** Wide lead card (Payload archive featured treatment). */
  featured?: boolean;
}

/**
 * Landing / index card for a journal entry (blog post or TIL).
 * Image-led when a hero is present — mirrors Payload website `Card`.
 */
export function JournalCard({ item, className, tone = 0, featured = false }: JournalCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  useLandingCardMotion(cardRef);

  const href =
    item.kind === "post"
      ? `/blogs/${encodeURIComponent(item.slug)}`
      : `/journals/${encodeURIComponent(item.slug)}`;
  const kindLabel = item.kind === "post" ? "Post" : "Journal";
  const cta = item.kind === "post" ? "Read post" : "Read journal";
  const hasHero = Boolean(item.heroImageUrl);

  return (
    <article
      ref={cardRef}
      data-test="journal-card"
      className={twMerge(
        "landing-card group relative flex flex-col overflow-hidden",
        cardSurfaces[tone],
        featured && "md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]",
        className,
      )}
    >
      <Link
        href={href}
        transitionTypes={["nav-forward"]}
        className={twMerge("flex flex-1 flex-col -outline-offset-2", featured && "md:contents")}
        aria-label={`${cta}: ${item.title}`}
      >
        {hasHero ? (
          <div
            className={twMerge(
              "relative aspect-16/10 overflow-hidden border-b border-landing-cream/8",
              featured && "md:aspect-auto md:min-h-72 md:border-r md:border-b-0",
            )}
          >
            <Image
              src={item.heroImageUrl!}
              alt=""
              fill
              sizes={
                featured
                  ? "(max-width: 768px) 100vw, 55vw"
                  : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          </div>
        ) : null}

        <div
          className={twMerge(
            "flex flex-1 flex-col gap-3 p-6 pt-4",
            featured && "md:justify-center md:p-8",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[0.65rem] font-semibold tracking-[0.22em] text-landing-olive uppercase">
              {kindLabel}
            </span>
            <time className="text-xs text-landing-sage/60" dateTime={item.created}>
              {item.createdLabel}
            </time>
          </div>

          <ViewTransition name={journalTitleVtName(item.slug)} share="text-morph" default="none">
            <h3
              className={twMerge(
                "line-clamp-2 font-serif leading-snug text-landing-cream",
                featured ? "text-3xl md:text-4xl" : "text-xl",
              )}
            >
              {item.title}
            </h3>
          </ViewTransition>

          <p
            className={twMerge(
              "text-sm leading-6 text-landing-sage/80",
              featured ? "line-clamp-3 md:text-base" : "line-clamp-2",
            )}
          >
            {item.description}
          </p>

          {item.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {item.tags.slice(0, featured ? 5 : 3).map((tag) => (
                <li key={tag} className="landing-card-tag">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-landing-cream/8 pt-4">
            <span className="inline-flex min-h-6 items-center gap-1 text-xs font-medium text-landing-sage transition-colors group-hover:text-landing-cream">
              {cta}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </span>

            {item.gist ? <span className="size-4" aria-hidden="true" /> : null}
          </div>
        </div>

        {!hasHero && item.previewHtml ? (
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
