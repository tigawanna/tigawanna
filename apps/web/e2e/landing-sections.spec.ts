import { expect, test } from "@playwright/test";
import { expected } from "./fixtures/expected";
import {
  assertLandingSectionId,
  expectCoreLandingContent,
  expectCurvedSectionsScrollThrough,
  expectDesktopStackCubeScrollFaces,
  expectSectionInView,
  expectUnderHeroSections,
  openCreatureFeature,
  openLanding,
  revealSection,
} from "./helpers/landing";

test.describe("landing sections @desktop", () => {
  test.skip(({ isMobile }) => isMobile, "Desktop chrome project only");

  test("renders telltale content across the full page", async ({ page }) => {
    await openLanding(page);
    await expectCoreLandingContent(page);
  });

  test("post-hero stack cube and how-I-work segments always mount", async ({ page }) => {
    await openLanding(page);
    await expectUnderHeroSections(page);
    await expect(page.getByTestId("stack-cube-desktop")).toBeVisible({ timeout: 30_000 });
  });

  test("stack cube face labels update while scrolling", async ({ page }) => {
    await openLanding(page);
    await expectDesktopStackCubeScrollFaces(page);
  });

  test("how-I-work curved segments advance through all five steps", async ({ page }) => {
    await openLanding(page);
    await expectCurvedSectionsScrollThrough(page);
  });

  test("stack cube and skills expose known config values", async ({ page }) => {
    await openLanding(page);

    // Dynamic cube chunk may still be on the SSR fallback briefly.
    await expect(page.getByTestId("stack-cube-desktop")).toBeVisible({ timeout: 30_000 });
    await page.getByTestId("stack-cube").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("stack-cube")).toBeVisible();
    await expect(page.getByTestId("stack-cube")).toContainText(expected.stackFace);

    await revealSection(page, "skills");
    await expect(page.getByTestId("tech-choices-desktop")).toBeVisible();
    await expect(page.getByTestId("landing-tech-choices")).toContainText(
      expected.techSummarySnippet,
    );
  });

  test("about curved sections include ownership copy", async ({ page }) => {
    await openLanding(page);
    await revealSection(page, "about");
    await expect(page.getByTestId("curved-section-1")).toContainText(expected.aboutTitle);
    await expect(page.getByTestId("landing-how-i-work")).toContainText(expected.aboutBodySnippet);
  });
});

test.describe("landing hash navigation @desktop", () => {
  test.skip(({ isMobile }) => isMobile, "Desktop chrome project only");

  test("navbar links scroll each major section into view", async ({ page }) => {
    await openLanding(page);
    // Let deferred client sections (projects) hydrate before measuring scroll.
    await revealSection(page, "projects");
    await expect(page.getByTestId("project-card").first()).toBeVisible({ timeout: 30_000 });

    const nav = page.getByTestId("landing-navbar");

    for (const { label, sectionId } of expected.navItems) {
      assertLandingSectionId(sectionId);
      await nav.getByRole("link", { name: label, exact: true }).first().click();
      await expectSectionInView(page, sectionId);
    }
  });
  test("Get in touch CTA scrolls to contact", async ({ page }) => {
    await openLanding(page);
    await page
      .getByTestId("landing-navbar")
      .getByRole("link", { name: /get in touch/i })
      .click();
    await expectSectionInView(page, "contact");
  });
});

test.describe("creature feature", () => {
  test("page exists and reveal slides are navigable", async ({ page }) => {
    await openCreatureFeature(page);

    await expect(page.getByTestId("creature-panel-excited")).toBeVisible();
    await expect(page.getByTestId("creature-panel-excited")).toContainText(/excited/i);

    await page.getByTestId("creature-feature-next").click();
    await expect(page.getByTestId("creature-panel-little")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("creature-panel-little")).toContainText(/little did i know/i);

    await page.getByTestId("creature-feature-next").click();
    await expect(page.getByTestId("creature-panel-feature")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId("creature-panel-feature")).toContainText(/feature/i);
  });
});
