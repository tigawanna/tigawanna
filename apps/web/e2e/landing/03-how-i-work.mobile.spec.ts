import { expect, test } from "@playwright/test";
import { expected } from "../fixtures/expected";
import {
  expectCurvedSectionsScrollThrough,
  openLandingAtHash,
  revealSection,
} from "../helpers/landing";

/**
 * Section 3 — How I work (`#about`) on mobile.
 * Same five steps; scroll-driven sticky panels must still advance on small viewports.
 */
test.describe("03 how I work @mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "Mobile project only");

  test("hash lands on about with all five steps mounted", async ({ page }) => {
    await openLandingAtHash(page, "about");
    await revealSection(page, "about");
    await expect(page.getByTestId("landing-how-i-work")).toBeVisible();

    for (let index = 0; index < expected.howIWorkTitles.length; index++) {
      const section = page.getByTestId(`curved-section-${index + 1}`);
      await expect(section).toBeAttached();
      await expect(section).toContainText(expected.howIWorkTitles[index]!);
    }
  });

  test("scrolls through all five how-I-work steps", async ({ page }) => {
    await openLandingAtHash(page, "about");
    await expectCurvedSectionsScrollThrough(page);
  });
});
