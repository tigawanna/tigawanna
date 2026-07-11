import { useQueryClient } from "@tanstack/react-query";
import { Hydrate } from "@tanstack/react-start";
import { belowFoldHydration } from "../../-utils/below-fold-hydration";
import { PortfolioGridSkeleton } from "../../cards/PortfolioGridSkeleton";
import { LandingSection, OrganicDivider, SectionEyebrow } from "../../primitives";
import { LandingProjects } from "./LandingProjects";
import {
  pinnedReposQueryOptions,
  recentReposQueryOptions,
} from "@/data-access-layer/portfolio/landng-page-query-options";

const MAX_LANDING_PROJECTS = 6;

function LandingProjectsFallback() {
  return (
    <LandingSection
      id="projects"
      tone="darkMid"
      className="text-landing-cream"
      dataTest="landing-projects"
    >
      <OrganicDivider tone="darkMid" />
      <OrganicDivider tone="darkMid" flip />

      <div className="container relative z-10">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <SectionEyebrow>Projects</SectionEyebrow>
          <h2 className="landing-section-heading">Open source projects</h2>
          <p className="landing-section-lead">
            Pinned highlights, recently pushed repos, and topic filters — pulled live from GitHub.
          </p>
        </div>

        <PortfolioGridSkeleton count={MAX_LANDING_PROJECTS} />
      </div>
    </LandingSection>
  );
}

export function LandingProjectsDeferred() {
  const queryClient = useQueryClient();

  return (
    <Hydrate
      {...belowFoldHydration}
      prefetch={async ({ preload }) => {
        await preload();
        await Promise.all([
          queryClient.prefetchQuery(pinnedReposQueryOptions),
          queryClient.prefetchQuery(recentReposQueryOptions),
        ]);
      }}
      fallback={<LandingProjectsFallback />}
    >
      <LandingProjects />
    </Hydrate>
  );
}
