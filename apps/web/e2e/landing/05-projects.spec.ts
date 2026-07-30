import { expect, test } from "@playwright/test";
import { openLandingAtHash, revealSection } from "../helpers/landing";

/**
 * Section 5 — Projects (`#projects`).
 * Assert CMS-backed cards (not static fixtures) and that Details opens a detail page.
 */
test.describe("05 projects", () => {
  test("hash lands on projects with cards from the CMS", async ({ page }) => {
    await openLandingAtHash(page, "projects");
    await revealSection(page, "projects");

    const section = page.getByTestId("landing-projects");
    await expect(section).toBeVisible();
    await expect(section).toContainText("Open source projects");

    const cards = page.getByTestId("project-card");
    await expect(cards.first()).toBeVisible({ timeout: 30_000 });
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("first card exposes Source / Details and opens the detail page", async ({ page }) => {
    await openLandingAtHash(page, "projects");
    await revealSection(page, "projects");

    const card = page.getByTestId("project-card").first();
    await expect(card).toBeVisible({ timeout: 30_000 });

    const source = card.getByRole("link", { name: /source/i });
    await expect(source).toHaveAttribute("href", /github\.com\//);

    const details = card.getByRole("link", { name: /details/i });
    const href = await details.getAttribute("href");
    expect(href).toMatch(/^\/project\//);

    await page.goto(href!, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("project-detail")).toBeVisible();
    await expect(
      page.getByTestId("project-detail").getByRole("link", { name: /github/i }),
    ).toHaveAttribute("href", /github\.com\//);
  });
});
