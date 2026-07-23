import { expect, test } from "@playwright/test";
import { expected } from "./fixtures/expected";
import {
  clickMobileNav,
  expectCoreLandingContent,
  expectSectionInView,
  openLanding,
  revealSection,
} from "./helpers/landing";

test.describe("landing mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "Mobile project only");

  test("opens and shows telltale content through contact", async ({ page }) => {
    await openLanding(page);
    await expect(page.getByTestId("landing-navbar").getByRole("button", { name: /open menu/i })).toBeVisible();
    await expectCoreLandingContent(page);
  });

  test("mobile menu hash links scroll to sections", async ({ page }) => {
    await openLanding(page);

    await clickMobileNav(page, "Projects");
    await expectSectionInView(page, "projects");

    await clickMobileNav(page, "Contact");
    await expectSectionInView(page, "contact");
  });

  test("mobile stack faces and tech choices render", async ({ page }) => {
    await openLanding(page);

    await page.getByTestId("stack-cube-mobile").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("stack-cube-mobile")).toBeVisible();
    await expect(page.getByTestId("stack-face-web")).toContainText(expected.stackTech);

    await revealSection(page, "skills");
    const mobileSkills = page.getByTestId("tech-choices-mobile");
    await expect(mobileSkills).toBeVisible();
    await expect(page.getByTestId("tech-choice-card-mobile")).toContainText(expected.techChoice);
    await mobileSkills.getByTestId("tech-choice-next").click();
    await expect(page.getByTestId("tech-choice-card-mobile")).toContainText("Zod");
  });
});
