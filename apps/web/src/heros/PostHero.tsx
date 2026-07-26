import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
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
 * Post / journal hero — cover image on top, then copy below.
 * Back control lives in the meta row (with date), under title + excerpt.
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
    <header data-test="post-hero" className="relative">
      {hasHero ? (
        <div
          className="relative aspect-21/9 w-full min-h-52 overflow-hidden sm:min-h-64 md:aspect-3/1 md:min-h-72"
          aria-hidden="true"
        >
          <Image
            src={doc.heroImageUrl!}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className={cn("container", hasHero ? "pt-10 pb-4" : "pt-8 pb-4")}>
        <div className="mx-auto max-w-3xl">
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

          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-x-10 sm:gap-y-4">
            <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:gap-x-14 sm:gap-y-4">
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

            <Link
              href={backHref}
              transitionTypes={["nav-back"]}
              data-test="post-hero-back"
              className="btn btn-ghost btn-sm w-fit gap-2 rounded-full border border-base-content/12 px-4 font-normal text-base-content/70 hover:border-base-content/20 hover:bg-base-200/60 hover:text-base-content"
            >
              <ArrowLeft className="size-3.5 opacity-70" aria-hidden="true" />
              {backLabel}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
