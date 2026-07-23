import { expect, type Locator, type Page } from "@playwright/test";
import { expected } from "../fixtures/expected";
import { installLandingNetworkMocks } from "./network";

const SECTION_SELECTORS = {
  about: "#about",
  skills: "#skills",
  projects: "#projects",
  articles: "#articles",
  infodiet: "#infodiet",
  journal: "#journal",
  contact: "#contact",
} as const;

export type LandingSectionId = keyof typeof SECTION_SELECTORS;

/**
 * Opens the landing page with network mocks installed and waits for the shell.
 *
 * Set `LANDING_PATH=/gg` to exercise the shared `@repo/ui/landing` route.
 */
export async function openLanding(page: Page) {
  await installLandingNetworkMocks(page);
  const landingPath = process.env.LANDING_PATH ?? "/";
  await page.goto(landingPath, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("landing-page")).toBeVisible();
  await expect(page.getByTestId("landing-hero")).toBeVisible();
  page.on("close", () => {
    void page.unrouteAll({ behavior: "ignoreErrors" }).catch(() => undefined);
  });
}

/**
 * Waits until a landing section exists in the DOM (may still be off-screen).
 */
export function sectionLocator(page: Page, id: LandingSectionId): Locator {
  return page.locator(SECTION_SELECTORS[id]);
}

/**
 * Asserts the section intersects the viewport below the fixed navbar.
 */
export async function expectSectionInView(page: Page, id: LandingSectionId) {
  const section = sectionLocator(page, id);
  await expect(section).toBeAttached();
  await expect
    .poll(
      async () => {
        return section.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          const navbarOffset = 80;
          return rect.top < window.innerHeight * 0.75 && rect.bottom > navbarOffset;
        });
      },
      { timeout: 20_000 },
    )
    .toBe(true);
}

/**
 * Clicks a desktop navbar hash link by its visible label.
 */
export async function clickDesktopNav(page: Page, label: string) {
  const nav = page.getByTestId("landing-navbar");
  await nav.locator("a", { hasText: label }).first().click();
}

/**
 * Opens the mobile menu and clicks a nav item from the drawer panel.
 */
export async function clickMobileNav(page: Page, label: string) {
  const nav = page.getByTestId("landing-navbar");
  const menuToggle = nav.getByTestId("landing-nav-menu");
  await expect(menuToggle).toBeVisible();

  // Menu handlers only work after hydration — poll until the drawer opens.
  await expect
    .poll(
      async () => {
        const aria = await menuToggle.getAttribute("aria-label");
        if (aria?.toLowerCase().includes("close")) {
          return true;
        }
        await menuToggle.click({ force: true });
        return false;
      },
      { timeout: 20_000 },
    )
    .toBe(true);

  const drawer = nav.locator("div.space-y-4.border-t");
  await expect(drawer).toBeVisible();
  await drawer.getByRole("link", { name: label, exact: true }).click();
}

/**
 * Scrolls a section into view without relying on hash nav (for content asserts).
 */
export async function revealSection(page: Page, id: LandingSectionId) {
  const section = sectionLocator(page, id);
  await expect(section).toBeAttached({ timeout: 30_000 });
  await section.evaluate((el) => {
    el.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await expect(section).toBeVisible();
}

/**
 * Shared telltale content checks used by desktop + mobile smoke coverage.
 */
export async function expectCoreLandingContent(page: Page) {
  // Creature-egg splits the first name visually ("Denn" + egg + "s"), so assert the surname.
  await expect(page.getByTestId("landing-hero")).toContainText("Waweru");
  await expect(page.getByTestId("landing-hero")).toContainText(expected.role);

  await revealSection(page, "about");
  await expect(page.getByTestId("landing-how-i-work")).toContainText(expected.aboutTitle);

  await revealSection(page, "skills");
  await expect(page.getByTestId("landing-tech-choices")).toContainText(expected.techChoice);

  await revealSection(page, "projects");
  await expect(page.getByTestId("landing-projects")).toBeVisible();
  await expect(page.getByTestId("project-card").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("landing-projects")).toContainText(expected.project.name);

  await revealSection(page, "articles");
  await expect(page.getByTestId("landing-articles")).toContainText(expected.article.title);

  await revealSection(page, "infodiet");
  await expect(page.getByTestId("landing-infodiet")).toContainText(expected.infoDiet.name);

  await revealSection(page, "journal");
  await expect(page.getByTestId("landing-lessons")).toContainText(expected.lesson.title);

  await revealSection(page, "contact");
  await expect(page.getByTestId("contact-form")).toBeVisible();
  await expect(page.getByTestId("contact-email-copy")).toContainText(expected.email);
  await expect(page.getByTestId("landing-footer")).toContainText(expected.brand);
}
