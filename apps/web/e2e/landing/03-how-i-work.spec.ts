import { expect, test } from "@playwright/test";
import { expected } from "../fixtures/expected";
import {
  expectCurvedSectionsScrollThrough,
  openLandingAtHash,
  revealSection,
} from "../helpers/landing";

/**
 * Section 3 — How I work (`#about`).
 * Jump to hash, then scroll until each of the five curved steps is visible.
 */
test.describe("03 how I work @desktop", () => {
  test.skip(({ isMobile }) => isMobile, "Desktop chrome project only");

  test("hash lands on about and first ownership step is present", async ({ page }) => {
    await openLandingAtHash(page, "about");
    await expectSectionAbout(page);
    await expect(page.getByTestId("curved-section-1")).toContainText(expected.aboutTitle);
    await expect(page.getByTestId("landing-how-i-work")).toContainText(expected.aboutBodySnippet);
  });

  test("scrolls through all five how-I-work steps", async ({ page }) => {
    await openLandingAtHash(page, "about");
    await expectCurvedSectionsScrollThrough(page);
  });
});

/**
 * Asserts the about section shell after hash navigation.
 */
async function expectSectionAbout(page: import("@playwright/test").Page) {
  await revealSection(page, "about");
  await expect(page.getByTestId("landing-how-i-work")).toBeVisible();
  await expect(page.getByTestId("curved-numbered-sections")).toBeAttached();
}
