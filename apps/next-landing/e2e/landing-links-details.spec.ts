import { expect, test } from "@playwright/test";
import { expected } from "./fixtures/expected";
import { openLanding, revealSection } from "./helpers/landing";

/**
 * Link / detail coverage runs on both desktop and mobile projects — hrefs and
 * detail routes are shared; layout differences are covered elsewhere.
 */
test.describe("landing links and detail pages", () => {
  test("project cards expose Source / Site / Details that match fixtures", async ({ page }) => {
    await openLanding(page);
    await revealSection(page, "projects");
    await expect(page.getByTestId("project-card").first()).toBeVisible({ timeout: 30_000 });

    const card = page
      .getByTestId("project-card")
      .filter({ hasText: expected.project.name })
      .first();
    await expect(card).toBeVisible();

    const source = card.getByRole("link", { name: /source/i });
    await expect(source).toHaveAttribute("href", expected.project.url);

    if (expected.project.homepageUrl) {
      await expect(card.getByRole("link", { name: /^site$/i })).toHaveAttribute(
        "href",
        expected.project.homepageUrl,
      );
    }

    const details = card.getByRole("link", { name: /details/i });
    await expect(details).toHaveAttribute("href", /\/project\/tigawanna\/tigawanna/);

    // Prefer an explicit navigation — Next view-transition soft nav was flaky under Playwright.
    const href = await details.getAttribute("href");
    expect(href).toBeTruthy();
    await page.goto(href!, { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("project-detail")).toBeVisible();
    await expect(page.getByTestId("project-detail")).toContainText(expected.project.name);
    await expect(page.getByTestId("project-detail")).toContainText(expected.project.nameWithOwner);
    if (expected.project.description) {
      await expect(page.getByTestId("project-detail")).toContainText(expected.project.description);
    }
    await expect(
      page.getByTestId("project-detail").getByRole("link", { name: /github/i }),
    ).toHaveAttribute("href", expected.project.url);
  });

  test("blog cards prefer Payload posts when seeded", async ({ page }) => {
    await openLanding(page);
    await revealSection(page, "blogs");

    const card = page
      .getByTestId("journal-card")
      .or(page.getByTestId("article-card"))
      .filter({ hasText: expected.article.title })
      .first();
    await expect(card).toBeVisible();

    const internal = card.getByRole("link", { name: /read post/i });
    const external = card.getByRole("link", { name: /read article/i });

    if ((await internal.count()) > 0) {
      await expect(internal).toHaveAttribute("href", /\/blogs\//);
    } else {
      await expect(external).toHaveAttribute("href", expected.article.url);
    }

    const seeMore = page.getByTestId("blogs-see-more");
    const href = await seeMore.getAttribute("href");
    expect(href === "/blogs" || href === expected.devto).toBe(true);
  });

  test("infodiet cards link to known sources", async ({ page }) => {
    await openLanding(page);
    await revealSection(page, "infodiet");

    const card = page.getByTestId(`infodiet-card-${expected.infoDiet.id}`);
    await expect(card).toHaveAttribute("href", expected.infoDiet.href);
    await expect(card).toContainText(expected.infoDiet.name);
  });

  test("journal cards open the detail page with known content", async ({ page }) => {
    await openLanding(page);
    await revealSection(page, "journal");

    const card = page.getByTestId("journal-card").filter({ hasText: expected.lesson.title }).first();
    const journalLink = card.getByRole("link", { name: /read journal/i });
    const href = await journalLink.getAttribute("href");
    expect(href).toBeTruthy();
    await page.goto(href!, { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("journal-detail")).toBeVisible();
    await expect(page.getByTestId("journal-detail")).toContainText(expected.lesson.title);
    await expect(page.getByTestId("journal-detail")).toContainText(expected.lesson.description);
  });

  test("contact block shows email and footer social hrefs", async ({ page }) => {
    await openLanding(page);
    await revealSection(page, "contact");

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
