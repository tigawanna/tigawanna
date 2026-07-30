/**
 * Telltale values asserted by landing e2e tests.
 *
 * Sourced from `@repo/site-constants`, web `AppConfig` nav, and static fixtures.
 */
import {
  howIWorkSections,
  infoDietSources,
  siteConfig,
  stackCubeFaces,
  techChoices,
} from "@repo/site-constants";
import { AppConfig } from "../../src/components/landing/config/system";
import {
  STATIC_ARTICLES,
  STATIC_LESSONS,
  STATIC_PINNED_PROJECTS,
} from "../../src/components/landing/data/static";

export const expected = {
  brand: siteConfig.brand,
  heroName: siteConfig.name,
  role: siteConfig.role,
  description: siteConfig.description,
  email: siteConfig.links.email,
  github: siteConfig.links.github,
  linkedin: siteConfig.links.linkedin,
  devto: siteConfig.links.devto,
  // Match the web navbar (`AppConfig`), not parked site `#articles` nav.
  navItems: AppConfig.navItems.map((item) => ({
    label: item.label,
    sectionId: item.href.replace(/^#/, ""),
  })),
  aboutTitle: howIWorkSections[0].title,
  aboutBodySnippet: howIWorkSections[0].body.slice(0, 40),
  /** Titles for each sticky “how I work” curved segment (scroll-driven). */
  howIWorkTitles: howIWorkSections.map((section) => section.title),
  stackFace: stackCubeFaces[0].label,
  stackTech: stackCubeFaces[0].techs[0],
  /** Desktop cube face labels in scroll order. */
  stackFaces: stackCubeFaces.map((face) => face.label),
  /** Mobile face panel `data-test` ids in scroll order. */
  stackFaceTestIds: stackCubeFaces.map((face) => `stack-face-${face.label.toLowerCase()}`),
  techChoice: techChoices[0].name,
  techSummarySnippet: techChoices[0].summary.slice(0, 40),
  /** Full ordered list for skills click/swipe-through coverage. */
  techChoices: techChoices.map((choice) => ({ id: choice.id, name: choice.name })),
  project: STATIC_PINNED_PROJECTS[0],
  article: STATIC_ARTICLES[0],
  infoDiet: infoDietSources[0],
  lesson: STATIC_LESSONS[0],
  contactHeading: siteConfig.contactHeading,
} as const;
