import { expect, test } from "@playwright/test";
import { expected } from "../fixtures/expected";
import {
  expectDesktopStackCubeScrollFaces,
  expectUnderHeroSections,
  openLanding,
  waitForInteractiveStackCube,
} from "../helpers/landing";

/**
 * Section 2 — Stack cube (desktop).
 * After hero: mount interactive cube, scroll timeline, assert each face label.
 */
test.describe("02 stack cube @desktop", () => {
  test.skip(({ isMobile }) => isMobile, "Desktop chrome project only");

  test("mounts under the hero and exposes known stack config", async ({ page }) => {
    await openLanding(page);
    await expectUnderHeroSections(page);

    await expect(page.getByTestId("stack-cube-desktop")).toBeAttached({ timeout: 60_000 });
    await page.getByTestId("stack-cube").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("stack-cube")).toContainText(expected.stackFace);
  });

  test("scrolls through every face label on the desktop timeline", async ({ page }) => {
    await openLanding(page);
    await waitForInteractiveStackCube(page);
    await expectDesktopStackCubeScrollFaces(page);
  });
});
