import { expect, test } from "@playwright/test";
import { expected } from "../fixtures/expected";
import {
  expectMobileTechChoicesSwipeThrough,
  openLandingAtHash,
  revealSection,
} from "../helpers/landing";

/**
 * Section 4 — Skills / tech choices (`#skills`) on mobile.
 * Swipe/next through the card deck until every tool has been shown.
 */
test.describe("04 skills @mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "Mobile project only");

  test("hash lands on skills with the mobile card deck", async ({ page }) => {
    await openLandingAtHash(page, "skills");
    await revealSection(page, "skills");
    await expect(page.getByTestId("tech-choices-mobile")).toBeVisible();
    await expect(page.getByTestId("tech-choice-card-mobile")).toContainText(expected.techChoice);
  });

  test("swipes through every tech-choice card", async ({ page }) => {
    await openLandingAtHash(page, "skills");
    await revealSection(page, "skills");
    await expectMobileTechChoicesSwipeThrough(page);
  });
});
