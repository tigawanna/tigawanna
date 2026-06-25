import { SmoothScroll } from "@/components/animation/SmoothScroll";
import { createFileRoute } from "@tanstack/react-router";
import {
  LandingNavbar,
  LandingHero,
  StackCube,
  LandingPeripheralCards,
  LandingFeatures,
  LandingProjects,
  LandingArticles,
  LandingLessons,
  LandingCTA,
  LandingFooter,
} from "./-components/landing";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
  return (
    <div data-test="landing-page" className="min-h-screen">
      <SmoothScroll />
      <LandingNavbar />
      <LandingHero />
      <StackCube />
      <LandingPeripheralCards />
      <LandingFeatures />
      <LandingProjects />
      <LandingArticles />
      <LandingLessons />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
