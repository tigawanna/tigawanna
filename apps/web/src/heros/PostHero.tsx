import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { journalTitleVtName } from "@/components/view-transitions/names";
import type { ContentKind, JournalDetail } from "@/types/journals";
import { cn } from "@/lib/cn";

type PostHeroProps = {
  doc: JournalDetail;
  backHref: "/blogs" | "/journals";
  backLabel: string;
  /** Extra link (e.g. GitHub Gist) shown in the meta row. */
  asideHref?: string | null;
  asideLabel?: string;
};

/**
 * Formats an ISO date for post heroes (Payload website-template style).
 */
function formatHeroDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Kind label shown above the title (mirrors Payload categories row).
 */
function kindLabel(kind: ContentKind): string {
  return kind === "post" ? "Post" : "TIL";
}

/**
 * Post / journal hero — adapted from Payload website template `PostHero`.
 * Left-aligned title + labeled meta; optional full-bleed cover with gradient.
 */
export function PostHero({
  doc,
  backHref,
  backLabel,
  asideHref,
  asideLabel = "Gist",
}: PostHeroProps) {
  const published = doc.publishedAt ?? doc.created;
  const hasHero = Boolean(doc.heroImageUrl);
  const tags = doc.tags.filter(Boolean);

  return (
    <header
      data-test="post-hero"
      className={cn("relative", hasHero ? "flex min-h-[min(72vh,42rem)] items-end" : "pt-8")}
    >
      {hasHero ? (
        <>
          <Image
            src={doc.heroImageUrl!}
            alt=""
            fill
            priority
            sizes="100vw"
            className="pointer-events-none -z-10 object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-base-100 via-base-100/55 to-transparent"
            aria-hidden="true"
          />
        </>
      ) : null}

      <div className="container relative z-10 w-full pb-10">
        <div className="mx-auto max-w-3xl">
          <Link
            href={backHref}
            transitionTypes={["nav-back"]}
            className="mb-8 inline-flex text-sm text-primary hover:underline"
          >
            {backLabel}
          </Link>

          <p className="mb-4 text-[0.7rem] font-semibold tracking-[0.22em] text-primary uppercase">
            {kindLabel(doc.kind)}
            {tags.length > 0 ? (
              <>
                <span className="mx-2 text-base-content/25" aria-hidden="true">
                  ·
                </span>
                <span className="font-medium tracking-[0.14em] text-base-content/55">
                  {tags.join(", ")}
                </span>
              </>
            ) : null}
          </p>

          <ViewTransition name={journalTitleVtName(doc.slug)} share="text-morph" default="none">
            <h1 className="text-balance font-serif text-4xl leading-[1.05] font-semibold tracking-[-0.04em] md:text-5xl lg:text-6xl">
              {doc.title}
            </h1>
          </ViewTransition>

          {doc.description ? (
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-base-content/70">
              {doc.description}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:gap-x-14 sm:gap-y-4">
            <div className="flex flex-col gap-1">
              <p className="text-xs tracking-[0.16em] text-base-content/45 uppercase">
                Date published
              </p>
              <time dateTime={published} className="text-sm text-base-content/85">
                {formatHeroDate(published)}
              </time>
            </div>

            {asideHref ? (
              <div className="flex flex-col gap-1">
                <p className="text-xs tracking-[0.16em] text-base-content/45 uppercase">Source</p>
                <a
                  href={asideHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  {asideLabel}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
