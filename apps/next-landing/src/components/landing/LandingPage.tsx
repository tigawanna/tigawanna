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

/**
 * Portfolio landing page composed for the Next.js experiment app.
 *
 * Sync composition only — no page-level awaits. Cached / async sections
 * resolve inside their own Server Components under Suspense so the static
 * shell (nav, hero, copy) is not blocked by GitHub / lessons data.
 */
export function LandingPage() {
  return (
    <div data-test="landing-page" className="min-h-screen">
      <LandingNavbar />
      <main id="main-content">
        <LandingHero />
        <StackCubeDeferred />
        <LandingHowIWork />
        <LandingFeaturesDeferred />
        <LandingProjects />
        <LandingArticles />
        <LandingInfodiet />
        <LandingLessonsDeferred />
        <LandingCTA />
      </main>
      <LandingFooter />
      <LandingScrollFabDeferred />
    </div>
  );
}
