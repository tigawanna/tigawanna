import { expect, test } from "@playwright/test";
import { expected } from "../fixtures/expected";
import {
  expectMobileStackFacesPopIn,
  expectUnderHeroSections,
  openLanding,
} from "../helpers/landing";

/**
 * Section 2 — Stack cube (mobile).
 * Mobile face panels pop in while scrolling — separate from the desktop timeline.
 */
test.describe("02 stack cube @mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "Mobile project only");

  test("mounts the mobile cube under the hero", async ({ page }) => {
    await openLanding(page);
    await expectUnderHeroSections(page);
    await expect(page.getByTestId("stack-cube-mobile")).toBeVisible();
    await expect(page.getByTestId("stack-face-web")).toContainText(expected.stackTech);
  });

  test("pops every stack face into view while scrolling", async ({ page }) => {
    await openLanding(page);
    await expectMobileStackFacesPopIn(page);
  });
});
