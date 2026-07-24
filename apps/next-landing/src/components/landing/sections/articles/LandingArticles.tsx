import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "../../config/site";
import { STATIC_ARTICLES } from "../../data/static";
import { getLandingPostPreviews } from "@/data-access/blogs";
import type { JournalPreviewItem } from "@/types/journals";
import { ArticleCard } from "../../cards/ArticleCard";
import { JournalCard } from "../../cards/JournalCard";
import { PortfolioGridSkeleton } from "../../cards/PortfolioGridSkeleton";
import { LandingSection, OrganicDivider, SectionEyebrow } from "../../primitives";

function LandingBlogsShell({
  children,
  seeMoreHref,
  seeMoreLabel,
  seeMoreExternal,
}: {
  children: ReactNode;
  seeMoreHref: string;
  seeMoreLabel: string;
  seeMoreExternal: boolean;
}) {
  return (
    <LandingSection
      id="blogs"
      tone="darkMid"
      className="text-landing-cream"
      dataTest="landing-blogs"
    >
      <OrganicDivider tone="darkMid" />
      <OrganicDivider tone="darkMid" flip />

      <div className="container relative z-10">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <SectionEyebrow>Blogs</SectionEyebrow>
          <h2 className="landing-section-heading">Writing in public.</h2>
          <p className="landing-section-lead">
            Published here first — then cross-posted to Dev.to with a canonical URL.
          </p>
        </div>

        {children}

        <div className="mt-10 text-center">
          {seeMoreExternal ? (
            <a
              href={seeMoreHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 rounded-full border border-primary/30 px-6 py-3 text-sm text-primary transition-colors hover:bg-primary/10"
              data-test="blogs-see-more"
            >
              {seeMoreLabel}
              <ArrowUpRight className="size-4" />
            </a>
          ) : (
            <Link
              href={seeMoreHref}
              transitionTypes={["nav-forward"]}
              className="inline-flex items-center justify-center gap-1 rounded-full border border-primary/30 px-6 py-3 text-sm text-primary transition-colors hover:bg-primary/10"
              data-test="blogs-see-more"
            >
              {seeMoreLabel}
              <ArrowUpRight className="size-4" />
            </Link>
          )}
        </div>
      </div>
    </LandingSection>
  );
}

function PayloadPostsGrid({ items }: { items: JournalPreviewItem[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, index) => (
        <JournalCard key={item.id} item={item} tone={(index % 3) as 0 | 1 | 2} />
      ))}
    </div>
  );
}

async function LandingBlogsContent() {
  const posts = await getLandingPostPreviews();

  if (posts.length > 0) {
    return (
      <LandingBlogsShell seeMoreHref="/blogs" seeMoreLabel="More blogs" seeMoreExternal={false}>
        <PayloadPostsGrid items={posts} />
      </LandingBlogsShell>
    );
  }

  return (
    <LandingBlogsShell
      seeMoreHref={siteConfig.links.devto}
      seeMoreLabel="More on Dev.to"
      seeMoreExternal
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {STATIC_ARTICLES.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </LandingBlogsShell>
  );
}

/**
 * Landing blogs section — Payload posts when published, else Dev.to fixtures.
 */
export function LandingArticles() {
  return (
    <Suspense
      fallback={
        <LandingBlogsShell
          seeMoreHref={siteConfig.links.devto}
          seeMoreLabel="More on Dev.to"
          seeMoreExternal
        >
          <PortfolioGridSkeleton count={4} />
        </LandingBlogsShell>
      }
    >
      <LandingBlogsContent />
    </Suspense>
  );
}
