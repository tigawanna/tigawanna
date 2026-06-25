import { siteConfig } from "@/config/site";
import { CreatureEggLowercaseI } from "@/components/creature-egg/CreatureEggTrigger";
import { STATIC_ARTICLES } from "@/data/portfolio/static";
import { ArrowUpRight } from "lucide-react";
import { ArticleCard } from "./ArticleCard";
import { LandingSection, OrganicDivider, SectionEyebrow } from "./LandingPrimitives";

export function LandingArticles() {
  return (
    <LandingSection
      id="articles"
      tone="darkMid"
      className="text-[#f6efd7]"
      dataTest="landing-articles"
    >
      <OrganicDivider tone="darkMid" />
      <OrganicDivider tone="darkMid" flip />

      <div className="container relative z-10">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <SectionEyebrow>Articles</SectionEyebrow>
          <h2 className="text-balance font-serif text-5xl leading-none font-semibold tracking-[-0.045em] md:text-7xl">
            Wr
            <CreatureEggLowercaseI />
            ting from the trenches.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#c5ccb4]/70">
            Published on Dev.to.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {STATIC_ARTICLES.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href={siteConfig.links.devto}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 rounded-full border border-primary/30 px-6 py-3 text-sm text-primary transition-colors hover:bg-primary/10"
            data-test="articles-see-more"
          >
            More on Dev.to
            <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </LandingSection>
  );
}
