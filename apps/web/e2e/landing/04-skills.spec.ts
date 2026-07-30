import { expect, test } from "@playwright/test";
import { expected } from "../fixtures/expected";
import {
  expectDesktopTechChoicesClickThrough,
  openLandingAtHash,
  revealSection,
  waitForInteractiveSkills,
} from "../helpers/landing";

/**
 * Section 4 — Skills / tech choices (`#skills`).
 * Jump to hash, then click through the desktop rail until every tool is shown.
 */
test.describe("04 skills @desktop", () => {
  test.skip(({ isMobile }) => isMobile, "Desktop chrome project only");

  test("hash lands on skills with the first tool visible", async ({ page }) => {
    await openLandingAtHash(page, "skills");
    await revealSection(page, "skills");
    await expect(page.getByTestId("landing-tech-choices")).toBeVisible();
    await waitForInteractiveSkills(page);
    await expect(page.getByTestId("tech-choices-desktop")).toBeVisible();
    await expect(page.getByTestId("landing-tech-choices")).toContainText(expected.techChoice);
    await expect(page.getByTestId("landing-tech-choices")).toContainText(
      expected.techSummarySnippet,
    );
  });

  test("clicks through every tech-choice rail item", async ({ page }) => {
    await openLandingAtHash(page, "skills");
    await revealSection(page, "skills");
    await expectDesktopTechChoicesClickThrough(page);
  });
});
