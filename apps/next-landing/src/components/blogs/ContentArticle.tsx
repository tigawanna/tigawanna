import type { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/layout/LandingFooter";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { PostHero } from "@/heros/PostHero";
import { RelatedPosts } from "@/components/blogs/RelatedPosts";
import { RichText } from "@/components/richtext/RichText";
import type { JournalDetail, JournalPreviewItem } from "@/types/journals";

type ContentArticleProps = {
  doc: JournalDetail;
  backHref: "/blogs" | "/journals";
  backLabel: string;
  dataTest: string;
  related: JournalPreviewItem[];
  relatedHeading?: string;
  asideHref?: string | null;
  asideLabel?: string;
  /** Fallback body when Lexical content is missing (static TILs). */
  fallbackBody?: ReactNode;
};

/**
 * Shared blog/journal article shell (Payload post page shape):
 * PostHero → Lexical body → RelatedPosts.
 */
export function ContentArticle({
  doc,
  backHref,
  backLabel,
  dataTest,
  related,
  relatedHeading,
  asideHref,
  asideLabel,
  fallbackBody,
}: ContentArticleProps) {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <LandingNavbar />
      <main className="min-h-screen pt-20 pb-24">
        <article data-test={dataTest}>
          <PostHero
            doc={doc}
            backHref={backHref}
            backLabel={backLabel}
            asideHref={asideHref}
            asideLabel={asideLabel}
          />

          <div className="container pt-10">
            <div className="mx-auto max-w-3xl">
              {doc.content ? (
                <RichText data={doc.content} enableGutter={false} />
              ) : (
                fallbackBody
              )}

              <RelatedPosts docs={related} heading={relatedHeading} />
            </div>
          </div>
        </article>
      </main>
      <LandingFooter />
    </div>
  );
}
