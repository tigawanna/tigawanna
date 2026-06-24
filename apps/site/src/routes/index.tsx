import { createFileRoute } from "@tanstack/react-router";
import {
  LandingNavbar,
  LandingHero,
  LandingFeatures,
  LandingShowcase,
  LandingProjectsPreview,
  LandingEnhancedExperience,
  LandingCTA,
  LandingFooter,
} from "./-components/landing";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
  return (
    <div data-test="landing-page" className="min-h-screen">
      <LandingNavbar />
      <LandingHero />
      <LandingShowcase />
      <LandingFeatures />
      <LandingProjectsPreview />
      <LandingEnhancedExperience />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
