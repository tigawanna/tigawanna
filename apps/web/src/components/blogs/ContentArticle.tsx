import type { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { LandingScrollFabDeferred } from "@/components/landing/layout/LandingScrollFabDeferred";
import { PostHero } from "@/heros/PostHero";
import { RichText } from "@/components/richtext/RichText";
import type { JournalDetail } from "@/types/journals";

type ContentArticleProps = {
  doc: JournalDetail;
  backHref: "/blogs" | "/journals";
  backLabel: string;
  dataTest: string;
  /** Related posts (often a Suspense-wrapped section). */
  related?: ReactNode;
  asideHref?: string | null;
  asideLabel?: string;
  /** Fallback body when Lexical content is missing (static TILs). */
  fallbackBody?: ReactNode;
};

/**
 * Shared blog/journal article shell (Payload post page shape):
 * PostHero → Lexical body → related slot.
 */
export function ContentArticle({
  doc,
  backHref,
  backLabel,
  dataTest,
  related,
  asideHref,
  asideLabel,
  fallbackBody,
}: ContentArticleProps) {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <LandingNavbar backHref={backHref} backLabel={backLabel} />
      <main className="min-h-screen pt-20 pb-24">
        <article data-test={dataTest}>
          <PostHero doc={doc} asideHref={asideHref} asideLabel={asideLabel} />

          <div className="container pt-10">
            <div className="mx-auto min-w-0 max-w-3xl overflow-x-clip">
              {doc.content ? <RichText data={doc.content} enableGutter={false} /> : fallbackBody}

              {related}
            </div>
          </div>
        </article>
      </main>
      <LandingFooter />
      <LandingScrollFabDeferred />
    </div>
  );
}
