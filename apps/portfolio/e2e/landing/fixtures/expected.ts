/**
 * Telltale values asserted by landing e2e tests.
 *
 * Sourced from the portfolio app config / static fixtures. E2E is app-coupled
 * (see `e2e/landing/README.md`) — it does not live inside `@repo/ui`.
 */
import {
  howIWorkSections,
  infoDietSources,
  stackCubeFaces,
  techChoices,
} from "../../../src/config/info";
import { siteConfig } from "../../../src/config/site";
import {
  STATIC_ARTICLES,
  STATIC_LESSONS,
  STATIC_PINNED_PROJECTS,
} from "../../../src/data/portfolio/static";

export const expected = {
  brand: "tigawanna",
  heroName: "Dennis Waweru",
  role: siteConfig.role,
  description: siteConfig.description,
  email: siteConfig.links.email,
  github: siteConfig.links.github,
  linkedin: siteConfig.links.linkedin,
  devto: siteConfig.links.devto,
  navItems: siteConfig.navItems.map((item) => ({
    label: item.label,
    sectionId: item.href.replace(/^#/, ""),
  })),
  aboutTitle: howIWorkSections[0].title,
  aboutBodySnippet: howIWorkSections[0].body.slice(0, 40),
  stackFace: stackCubeFaces[0].label,
  stackTech: stackCubeFaces[0].techs[0],
  techChoice: techChoices[0].name,
  techSummarySnippet: techChoices[0].summary.slice(0, 40),
  project: STATIC_PINNED_PROJECTS[0],
  article: STATIC_ARTICLES[0],
  infoDiet: infoDietSources[0],
  lesson: STATIC_LESSONS[0],
  contactHeading: siteConfig.contactHeading,
} as const;
