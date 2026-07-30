import { expect, test } from "@playwright/test";
import { expected } from "../fixtures/expected";
import { openLanding } from "../helpers/landing";

/**
 * Section 1 — Hero.
 * Load `/`, assert brand + hero copy before any hash navigation.
 */
test.describe("01 hero", () => {
  test("shows brand, name, role, and description", async ({ page, isMobile }) => {
    await openLanding(page);

    const hero = page.getByTestId("landing-hero");
    await expect(hero).toBeVisible();
    await expect(hero).toContainText(expected.heroName);
    await expect(hero).toContainText(expected.role);
    await expect(hero).toContainText(expected.description);

    const nav = page.getByTestId("landing-navbar");
    await expect(nav.getByTestId("landing-nav-brand")).toContainText(expected.brand);

    if (isMobile) {
      await expect(nav.getByTestId("landing-nav-menu")).toBeVisible();
    } else {
      await expect(nav.getByRole("link", { name: /get in touch/i })).toBeVisible();
    }
  });
});
