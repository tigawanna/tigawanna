import { createFileRoute } from "@tanstack/react-router"
import {
  LandingNavbar,
  LandingHero,
  LandingFeatures,
  LandingShowcase,
  LandingCTA,
  LandingFooter,
} from "./-components/landing"
import { AppConfig } from "@/utils/system"

export const Route = createFileRoute("/")({ component: LandingPage })

function LandingPage() {
  return (
    <div data-test="landing-page" className="min-h-screen">
      <LandingNavbar />
      <LandingHero />
      <LandingShowcase />
      <LandingFeatures />
      <ProjectsPlaceholder />
      <LandingCTA />
      <LandingFooter />
    </div>
  )
}

function ProjectsPlaceholder() {
  return (
    <section id="projects" className="scroll-mt-20 bg-base-100 py-24">
      <div className="container text-center">
        <h2 className="mb-4 bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
          Projects
        </h2>
        <p className="mx-auto mb-8 max-w-lg text-lg text-base-content/60">
          GitHub projects, articles, and talks from the legacy site will land here next.
        </p>
        <a
          href={AppConfig.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Browse GitHub
        </a>
      </div>
    </section>
  )
}
