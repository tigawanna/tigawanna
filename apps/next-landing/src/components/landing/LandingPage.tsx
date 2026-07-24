import type { LessonPreviewItem } from "./types/lessons";
import type { GithubRepoNode } from "./types/github";
import { LandingFooter } from "./layout/LandingFooter";
import { LandingNavbar } from "./layout/LandingNavbar";
import { LandingScrollFabDeferred } from "./layout/LandingScrollFabDeferred";
import { LandingHowIWork } from "./sections/about/LandingHowIWork";
import { LandingArticles } from "./sections/articles/LandingArticles";
import { LandingCTA } from "./sections/contact/LandingCTA";
import { LandingFeaturesDeferred } from "./sections/features/LandingFeaturesDeferred";
import { LandingHero } from "./sections/hero/LandingHero";
import { LandingInfodiet } from "./sections/infodiet/LandingInfodiet";
import { LandingLessonsDeferred } from "./sections/lessons/LandingLessonsDeferred";
import { LandingProjects } from "./sections/projects/LandingProjects";
import { StackCubeDeferred } from "./sections/stack-cube/StackCubeDeferred";

export type LandingPageProps = {
  lessonPreviews: LessonPreviewItem[];
  pinnedRepos: GithubRepoNode[];
  recentRepos: GithubRepoNode[];
};

/**
 * Portfolio landing page composed for the Next.js experiment app.
 * Data is fetched in Server Components and passed in as props.
 */
export function LandingPage({ lessonPreviews, pinnedRepos, recentRepos }: LandingPageProps) {
  return (
    <div data-test="landing-page" className="min-h-screen">
      <LandingNavbar />
      <main id="main-content">
        <LandingHero />
        <StackCubeDeferred />
        <LandingHowIWork />
        <LandingFeaturesDeferred />
        <LandingProjects pinnedRepos={pinnedRepos} recentRepos={recentRepos} />
        <LandingArticles />
        <LandingInfodiet />
        <LandingLessonsDeferred items={lessonPreviews} />
        <LandingCTA />
      </main>
      <LandingFooter />
      <LandingScrollFabDeferred />
    </div>
  );
}
