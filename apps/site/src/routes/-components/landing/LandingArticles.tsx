import { devtoArticlesQueryOptions } from "@/data-access-layer/portfolio/query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { ArticleCard } from "./ArticleCard";
import { LandingSection, OrganicDivider, ScrollReveal, SectionEyebrow } from "./LandingPrimitives";
import { PortfolioGridSkeleton } from "./PortfolioGridSkeleton";

function ArticlesContent() {
  const { data: articles } = useSuspenseQuery(devtoArticlesQueryOptions);

  if (!articles.length) {
    return (
      <p className="rounded-[2rem] border border-[#1b1d14]/10 bg-[#ece6cf]/60 p-8 text-center text-[#1b1d14]/70">
        No articles to show yet. Configure DEV_TO_KEY to load Dev.to posts.
      </p>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

export function LandingArticles() {
  return (
    <LandingSection
      id="articles"
      tone="base"
      className="text-base-content"
      dataTest="landing-articles"
    >
      <OrganicDivider tone="base" />
      <OrganicDivider tone="base" flip />

      <div className="container relative z-10">
        <ScrollReveal className="mx-auto mb-14 max-w-3xl text-center">
          <SectionEyebrow>Articles</SectionEyebrow>
          <h2 className="text-balance font-serif text-5xl leading-none font-semibold tracking-[-0.045em] md:text-7xl">
            Writing from the trenches.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-base-content/70">
            Latest posts from Dev.to — tutorials, notes, and things I had to learn the hard way.
          </p>
        </ScrollReveal>

        <Suspense fallback={<PortfolioGridSkeleton count={4} />}>
          <ArticlesContent />
        </Suspense>
      </div>
    </LandingSection>
  );
}
