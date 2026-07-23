/**
 * Telltale values asserted by landing e2e tests.
 *
 * Sourced from the same config / static fixtures the UI imports so failures mean
 * the page stopped rendering known content — not that copy drifted silently.
 *
 * Import paths assume: `src/routes/-components/landing/tests/fixtures` → `src/config|data`
 * (five `../` segments). When porting this folder, keep that relative layout or update these imports.
 */
import {
  howIWorkSections,
  infoDietSources,
  stackCubeFaces,
  techChoices,
} from "../../../../../config/info";
import { siteConfig } from "../../../../../config/site";
import {
  STATIC_ARTICLES,
  STATIC_LESSONS,
  STATIC_PINNED_PROJECTS,
} from "../../../../../data/portfolio/static";

export const expected = {
  brand: "tigawanna",
  heroName: "Dennis Waweru",
  role: siteConfig.role,
  description: siteConfig.description,
  email: siteConfig.links.email,
  github: siteConfig.links.github,
  linkedin: siteConfig.links.linkedin,
  devto: siteConfig.links.devto,
  navLabels: siteConfig.navItems.map((item) => item.label),
  sectionIds: siteConfig.navItems.map((item) => item.href.replace(/^#/, "")),
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
  contactHeading: "Let's make the next system less haunted.",
} as const;
