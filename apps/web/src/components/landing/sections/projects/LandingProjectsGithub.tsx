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
        a day.
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
      dataTest="landing-projects-github"
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
 * Streams the live GitHub projects grid. Returns nothing when the fetch fails
 * or yields no repos so the whole section stays off the page.
 */
async function LandingProjectsGithubContent() {
  const data = await getCachedGithubLandingRepos();

  if (!data) {
    return null;
  }

  const { pinnedRepos, recentRepos } = data;
  const featured = (pinnedRepos.length > 0 ? pinnedRepos : recentRepos).slice(
    0,
    MAX_LANDING_PROJECTS,
  );

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
 * Landing projects section fed by day-cached GitHub GraphQL (`listGithubRepos`),
 * with Payload repositories as backup when GitHub fails.
 *
 * No Suspense skeleton: the section only mounts once data is available.
 * Only when both GitHub and Payload fail is the section omitted entirely.
 */
export function LandingProjectsGithub() {
  return (
    <Suspense fallback={null}>
      <LandingProjectsGithubContent />
    </Suspense>
  );
}
