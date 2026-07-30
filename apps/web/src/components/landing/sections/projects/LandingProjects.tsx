import { Suspense, type ReactNode } from "react";
import { getPinnedRepos, getRecentRepos } from "@/data-access/landing";
import { PortfolioGridSkeleton } from "../../cards/PortfolioGridSkeleton";
import { LandingSection, OrganicDivider, SectionEyebrow } from "../../primitives";
import { ProjectsSearchIsland } from "./ProjectsSearchIsland";

const MAX_LANDING_PROJECTS = 6;

function ProjectsHeader() {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <SectionEyebrow>Projects</SectionEyebrow>
      <h2 className="landing-section-heading">Open source projects</h2>
      <p className="landing-section-lead">
        Featured pins, recent pushes, and category filters — served from the site CMS and refreshed
        from GitHub on a schedule.
      </p>
    </div>
  );
}

export function LandingProjectsShell({ children }: { children: ReactNode }) {
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
        <ProjectsHeader />
        {children}
      </div>
    </LandingSection>
  );
}

async function LandingProjectsContent() {
  const [pinnedRepos, recentRepos] = await Promise.all([getPinnedRepos(), getRecentRepos()]);

  if (pinnedRepos.length === 0 && recentRepos.length === 0) {
    return null;
  }

  const featured = (pinnedRepos.length > 0 ? pinnedRepos : recentRepos).slice(
    0,
    MAX_LANDING_PROJECTS,
  );

  return (
    <ProjectsSearchIsland pinnedRepos={pinnedRepos} recentRepos={recentRepos} featured={featured} />
  );
}

/**
 * Projects section — one stable `#projects` shell; only the grid streams under Suspense
 * so fallback + content never duplicate the section id in the DOM.
 */
export function LandingProjects() {
  return (
    <LandingProjectsShell>
      <Suspense fallback={<PortfolioGridSkeleton count={6} />}>
        <LandingProjectsContent />
      </Suspense>
    </LandingProjectsShell>
  );
}
