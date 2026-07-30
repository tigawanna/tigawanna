import { expect, test } from "@playwright/test";
import { expected } from "../fixtures/expected";
import {
  assertLandingSectionId,
  clickDesktopNav,
  clickMobileNav,
  expectSectionInView,
  openCreatureFeature,
  openLanding,
  openLandingAtHash,
  revealSection,
} from "../helpers/landing";

/**
 * Section 6 — Blogs, Infodiet, Journal, Contact (+ nav + creature feature).
 * One file for the lower page so section 1–5 stay focused.
 */
test.describe("06 blogs through contact", () => {
  test("blogs section shows known writing", async ({ page }) => {
    await openLandingAtHash(page, "blogs");
    await revealSection(page, "blogs");

    const card = page
      .getByTestId("journal-card")
      .or(page.getByTestId("article-card"))
      .filter({ hasText: expected.article.title })
      .first();
    await expect(card).toBeVisible();

    const seeMore = page.getByTestId("blogs-see-more");
    const href = await seeMore.getAttribute("href");
    expect(href === "/blogs" || href === expected.devto).toBe(true);
  });

  test("infodiet cards link to known sources", async ({ page }) => {
    await openLandingAtHash(page, "infodiet");
    await revealSection(page, "infodiet");

    const card = page.getByTestId(`infodiet-card-${expected.infoDiet.id}`);
    await expect(card).toHaveAttribute("href", expected.infoDiet.href);
    await expect(card).toContainText(expected.infoDiet.name);
  });

  test("journal cards open the detail page", async ({ page }) => {
    await openLandingAtHash(page, "journal");
    await revealSection(page, "journal");

    const section = page.getByTestId("landing-journals");
    const card = section.getByTestId("journal-card").first();
    await expect(card).toBeVisible({ timeout: 30_000 });
    const title = (await card.locator("h3").first().textContent())?.trim();
    expect(title).toBeTruthy();

    const journalLink = card.getByRole("link").first();
    const href = await journalLink.getAttribute("href");
    expect(href).toMatch(/^\/journals\//);
    await page.goto(href!, { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("journal-detail")).toBeVisible();
    await expect(page.getByTestId("journal-detail")).toContainText(title!);
  });

  test("contact shows email and footer social hrefs", async ({ page }) => {
    await openLandingAtHash(page, "contact");
    await revealSection(page, "contact");

    await expect(page.getByTestId("contact-form")).toBeVisible();
    await expect(page.getByTestId("contact-email-copy").getByRole("link")).toHaveAttribute(
      "href",
      `mailto:${expected.email}`,
    );
    await expect(page.getByRole("heading", { name: expected.contactHeading })).toBeVisible();

    const footer = page.getByTestId("landing-footer");
    await expect(footer.getByTestId("footer-contact-github").getByRole("link")).toHaveAttribute(
      "href",
      expected.github,
    );
    await expect(footer.getByTestId("footer-contact-linkedin").getByRole("link")).toHaveAttribute(
      "href",
      expected.linkedin,
    );
    await expect(footer.getByTestId("footer-contact-dev.to").getByRole("link")).toHaveAttribute(
      "href",
      expected.devto,
    );
  });
});

test.describe("06 navbar hash navigation @desktop", () => {
  test.skip(({ isMobile }) => isMobile, "Desktop chrome project only");

  test("navbar links scroll each major section into view", async ({ page }) => {
    await openLanding(page);
    await revealSection(page, "projects");
    await expect(page.getByTestId("project-card").first()).toBeVisible({ timeout: 30_000 });

    for (const { label, sectionId } of expected.navItems) {
      assertLandingSectionId(sectionId);
      await clickDesktopNav(page, label);
      await expectSectionInView(page, sectionId);
    }
  });

  test("Get in touch CTA scrolls to contact", async ({ page }) => {
    await openLanding(page);
    await page
      .getByTestId("landing-navbar")
      .getByRole("link", { name: /get in touch/i })
      .click({ timeout: 15_000 });
    await expectSectionInView(page, "contact");
  });
});

test.describe("06 navbar hash navigation @mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "Mobile project only");

  test("mobile menu hash links scroll to sections", async ({ page }) => {
    await openLanding(page);
    await clickMobileNav(page, "Projects");
    await expectSectionInView(page, "projects");
    await clickMobileNav(page, "Contact");
    await expectSectionInView(page, "contact");
  });
});

test.describe("06 creature feature", () => {
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
