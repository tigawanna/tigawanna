import { Suspense, type ReactNode } from "react";

import { getCachedGithubLandingRepos } from "@/data-access/github-landing-repos";
import { LandingSection, OrganicDivider, SectionEyebrow } from "../../primitives";
import { ProjectsSearchIsland } from "./ProjectsSearchIsland";

const MAX_LANDING_PROJECTS = 6;

function ProjectsHeader() {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <SectionEyebrow>Projects</SectionEyebrow>
      <h2 className="landing-section-heading">Open source projects</h2>
      <p className="landing-section-lead">
        Featured pins, recent pushes, and category filters — fetched live from GitHub and cached for
        about 15 minutes.
      </p>
    </div>
  );
}

function LandingProjectsGithubShell({ children }: { children: ReactNode }) {
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

/**
 * Streams the projects grid (GitHub → Payload → static fixtures).
 */
async function LandingProjectsGithubContent() {
  const { pinnedRepos, recentRepos } = await getCachedGithubLandingRepos();

  const featured = (pinnedRepos.length > 0 ? pinnedRepos : recentRepos).slice(
    0,
    MAX_LANDING_PROJECTS,
  );

  if (featured.length === 0) {
    return null;
  }

  return (
    <LandingProjectsGithubShell>
      <ProjectsSearchIsland
        pinnedRepos={pinnedRepos}
        recentRepos={recentRepos}
        featured={featured}
      />
    </LandingProjectsGithubShell>
  );
}

/**
 * Landing projects section: ~15m cached GitHub GraphQL, Payload backup, then static fixtures.
 * No Suspense skeleton — section mounts once data resolves (fixtures guarantee content for e2e).
 */
export function LandingProjectsGithub() {
  return (
    <Suspense fallback={null}>
      <LandingProjectsGithubContent />
    </Suspense>
  );
}
