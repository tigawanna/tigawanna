import { expect, type Locator, type Page } from "@playwright/test";
import { expected } from "../fixtures/expected";
import { installLandingNetworkMocks } from "./network";

const SECTION_TEST_IDS = {
  about: "landing-how-i-work",
  skills: "landing-tech-choices",
  projects: "landing-projects",
  blogs: "landing-blogs",
  infodiet: "landing-infodiet",
  journal: "landing-journals",
  contact: "landing-contact",
} as const;

export type LandingSectionId = keyof typeof SECTION_TEST_IDS;

/**
 * Narrows a nav href id to a known landing section, or throws.
 */
export function assertLandingSectionId(id: string): asserts id is LandingSectionId {
  if (!(id in SECTION_TEST_IDS)) {
    throw new Error(`Unknown landing section id: ${id}`);
  }
}

/**
 * Opens the landing page with network mocks and waits for the hero shell.
 */
export async function openLanding(page: Page) {
  await installLandingNetworkMocks(page);
  const landingPath = process.env.LANDING_PATH ?? "/";
  await page.goto(landingPath, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("landing-page")).toBeVisible();
  await expect(page.getByTestId("landing-hero")).toBeVisible();
}

/**
 * Opens `/` then jumps to a hash section (updates location + scrolls).
 *
 * @param page - Playwright page.
 * @param hash - Section hash with or without `#` (e.g. `about` or `#skills`).
 */
export async function openLandingAtHash(page: Page, hash: string) {
  await openLanding(page);
  const id = hash.replace(/^#/, "");
  if (id in SECTION_TEST_IDS) {
    await revealSection(page, id as LandingSectionId);
  } else {
    await page.locator(`#${id}`).first().scrollIntoViewIfNeeded();
  }
  await page.evaluate(
    (sectionId) => {
      history.replaceState(null, "", `#${sectionId}`);
    },
    id.replace(/^#/, ""),
  );
}

/**
 * Locator for a major landing section via `data-test`.
 */
export function sectionLocator(page: Page, id: LandingSectionId): Locator {
  return page.getByTestId(SECTION_TEST_IDS[id]);
}

/**
 * Asserts the section intersects the viewport below the fixed navbar.
 */
export async function expectSectionInView(page: Page, id: LandingSectionId) {
  const section = sectionLocator(page, id);
  await expect(section).toBeAttached({ timeout: 30_000 });
  await expect
    .poll(
      async () => {
        return section.evaluate((el) => {
          const rect = el.getBoundingClientRect();
          const navbar = document.querySelector('[data-test="landing-navbar"]');
          const navbarOffset = navbar?.getBoundingClientRect().height ?? 80;
          return rect.top < window.innerHeight * 0.75 && rect.bottom > navbarOffset;
        });
      },
      { timeout: 20_000 },
    )
    .toBe(true);
}

/**
 * Scrolls a section into view without relying on hash nav.
 * Re-queries after attach so Suspense/dynamic swaps don't leave a detached node.
 */
export async function revealSection(page: Page, id: LandingSectionId) {
  await expect(sectionLocator(page, id)).toBeAttached({ timeout: 30_000 });
  // Skills (and similar) swap fallback → interactive under the same data-test.
  if (id === "skills") {
    await waitForInteractiveSkills(page);
  }
  const section = sectionLocator(page, id);
  await section.scrollIntoViewIfNeeded();
  await expect(section).toBeVisible({ timeout: 15_000 });
}

/**
 * Clicks a desktop navbar hash link by its visible label.
 */
export async function clickDesktopNav(page: Page, label: string) {
  const nav = page.getByTestId("landing-navbar");
  await nav.getByRole("link", { name: label, exact: true }).first().click();
}

/**
 * Opens the mobile menu and clicks a nav item from the drawer panel.
 */
export async function clickMobileNav(page: Page, label: string) {
  const nav = page.getByTestId("landing-navbar");
  const menuToggle = nav.getByTestId("landing-nav-menu");
  await expect(menuToggle).toBeVisible();

  await expect
    .poll(
      async () => {
        const aria = await menuToggle.getAttribute("aria-label");
        if (aria?.toLowerCase().includes("close")) {
          return true;
        }
        await menuToggle.click({ force: true });
        return false;
      },
      { timeout: 20_000 },
    )
    .toBe(true);

  const drawer = nav.getByTestId("landing-nav-drawer");
  await expect(drawer).toBeVisible();
  await drawer.getByRole("link", { name: label, exact: true }).click();
}

/**
 * Waits for the deferred interactive stack cube (past the SSR fallback shell).
 * Desktop and mobile variants both mount; CSS hides the inactive breakpoint.
 */
export async function waitForInteractiveStackCube(page: Page) {
  await expect
    .poll(
      async () =>
        (await page.getByTestId("stack-cube-desktop").count()) +
          (await page.getByTestId("stack-cube-mobile").count()) >
        0,
      { timeout: 60_000 },
    )
    .toBe(true);
}

/**
 * Waits for the deferred interactive skills panels (past the static fallback card).
 */
export async function waitForInteractiveSkills(page: Page) {
  await expect
    .poll(
      async () =>
        (await page.getByTestId("tech-choices-desktop").count()) +
          (await page.getByTestId("tech-choices-mobile").count()) >
        0,
      { timeout: 60_000 },
    )
    .toBe(true);
}

/**
 * Asserts the post-hero stack cube + how-I-work shell always mount.
 */
export async function expectUnderHeroSections(page: Page) {
  await expect(page.getByTestId("stack-cube")).toBeAttached({ timeout: 30_000 });
  await waitForInteractiveStackCube(page);
  await expect(page.getByTestId("landing-how-i-work")).toBeAttached();
  await expect(page.getByTestId("curved-numbered-sections")).toBeAttached();

  for (let index = 0; index < expected.howIWorkTitles.length; index++) {
    const section = page.getByTestId(`curved-section-${index + 1}`);
    await expect(section).toBeAttached();
    await expect(section).toContainText(expected.howIWorkTitles[index]!);
  }
}

/**
 * Desktop: scroll through the tall stack-cube timeline and assert face labels update.
 */
export async function expectDesktopStackCubeScrollFaces(page: Page) {
  const cube = page.getByTestId("stack-cube-desktop");
  await expect(cube).toBeVisible({ timeout: 30_000 });

  const metrics = await cube.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      height: rect.height,
      vh: window.innerHeight,
    };
  });
  const travel = metrics.height - metrics.vh;
  const fractions = [0.02, 0.22, 0.65, 0.98] as const;

  for (let index = 0; index < expected.stackFaces.length; index++) {
    const label = expected.stackFaces[index]!;
    const frac = fractions[index] ?? 1;
    await page.evaluate(
      ({ top, travel: travelPx, frac: scrollFrac }) => {
        window.scrollTo({ top: top + travelPx * scrollFrac, behavior: "instant" });
      },
      { top: metrics.top, travel, frac },
    );

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const labels = Array.from(document.querySelectorAll(".stack-cube-label"));
            let best = { text: "", opacity: -1 };
            for (const el of labels) {
              const opacity = Number(getComputedStyle(el).opacity);
              if (opacity >= best.opacity) {
                best = {
                  text: el.querySelector("h3")?.textContent?.trim() ?? "",
                  opacity,
                };
              }
            }
            return best.text;
          }),
        { timeout: 10_000 },
      )
      .toBe(label);
  }
}

/**
 * Scroll each sticky how-I-work segment and assert the frontmost panel title updates.
 */
export async function expectCurvedSectionsScrollThrough(page: Page) {
  const about = page.getByTestId("landing-how-i-work");
  await expect(about).toBeAttached({ timeout: 30_000 });
  await waitForInteractiveStackCube(page);

  await about.evaluate((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - 24), behavior: "instant" });
  });

  const panelTops = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>("[data-curved-section]")).map(
      (el) => el.getBoundingClientRect().top + window.scrollY,
    ),
  );
  expect(panelTops.length).toBe(expected.howIWorkTitles.length);

  for (let index = 0; index < expected.howIWorkTitles.length; index++) {
    const title = expected.howIWorkTitles[index]!;
    const panelTop = panelTops[index]!;
    await page.evaluate((top) => {
      window.scrollTo({ top: top + 12, behavior: "instant" });
    }, panelTop);

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const panels = Array.from(
              document.querySelectorAll<HTMLElement>("[data-curved-section]"),
            );
            const stuck = panels.filter((panel) => panel.getBoundingClientRect().top <= 2);
            stuck.sort(
              (a, b) => Number(getComputedStyle(b).zIndex) - Number(getComputedStyle(a).zIndex),
            );
            return stuck[0]?.querySelector("h3")?.textContent?.trim() ?? null;
          }),
        { timeout: 10_000 },
      )
      .toBe(title);

    await expect
      .poll(
        async () =>
          page.evaluate((panelNumber) => {
            const panel = document.querySelector(`[data-test="curved-section-${panelNumber}"]`);
            const content = panel?.querySelector<HTMLElement>("[data-curved-content]");
            if (!content) return 0;
            return Number(content.style.opacity || getComputedStyle(content).opacity);
          }, index + 1),
        { timeout: 10_000 },
      )
      .toBeGreaterThan(0.9);
  }
}

/**
 * Mobile: scroll each stack-face panel until its content pops in.
 */
export async function expectMobileStackFacesPopIn(page: Page) {
  const mobile = page.getByTestId("stack-cube-mobile");
  await expect(mobile).toBeVisible();

  await mobile.evaluate((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "instant" });
  });

  const faces = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>("[data-face-panel]")).map((el) => ({
      id: el.getAttribute("data-test") ?? "",
      label: el.querySelector("h3")?.textContent?.trim() ?? "",
      top: el.getBoundingClientRect().top + window.scrollY,
    })),
  );
  expect(faces.length).toBe(expected.stackFaces.length);

  const vh = await page.evaluate(() => window.innerHeight);

  for (let index = 0; index < faces.length; index++) {
    const face = faces[index]!;
    const offset = index === 0 ? 0.15 : 0.55;
    await page.evaluate(
      ({ top, viewport, scrollOffset }) => {
        window.scrollTo({ top: top + viewport * scrollOffset, behavior: "instant" });
      },
      { top: face.top, viewport: vh, scrollOffset: offset },
    );

    await expect
      .poll(
        async () =>
          page.evaluate((id) => {
            const content = document.querySelector(
              `[data-test="${id}"] [data-face-content]`,
            ) as HTMLElement | null;
            if (!content) return 0;
            return Number(content.style.opacity || getComputedStyle(content).opacity);
          }, face.id),
        { timeout: 10_000 },
      )
      .toBeGreaterThan(0.85);

    await expect(page.getByTestId(face.id)).toContainText(face.label);
  }
}

/**
 * Desktop skills: step through every tool with the next control (avoids page-scroll from rail items).
 */
export async function expectDesktopTechChoicesClickThrough(page: Page) {
  await waitForInteractiveSkills(page);
  const desktop = page.getByTestId("tech-choices-desktop");
  await expect(desktop).toBeVisible();
  const panel = page.locator("#tech-choice-detail-panel");
  const next = desktop.getByTestId("tech-choice-next");

  for (let index = 0; index < expected.techChoices.length; index++) {
    const choice = expected.techChoices[index]!;
    await expect(panel).toHaveAttribute("aria-labelledby", `tech-choice-tab-${choice.id}`, {
      timeout: 10_000,
    });
    await expect(panel).toContainText(choice.name);
    if (index < expected.techChoices.length - 1) {
      await next.click();
    }
  }
}

/**
 * Mobile skills: next through every tech-choice card.
 */
export async function expectMobileTechChoicesSwipeThrough(page: Page) {
  await waitForInteractiveSkills(page);
  const mobileSkills = page.getByTestId("tech-choices-mobile");
  await expect(mobileSkills).toBeVisible();
  const card = page.getByTestId("tech-choice-card-mobile");

  for (let index = 0; index < expected.techChoices.length; index++) {
    const choice = expected.techChoices[index]!;
    await expect(card).toContainText(choice.name);
    if (index < expected.techChoices.length - 1) {
      await mobileSkills.getByTestId("tech-choice-next").click();
    }
  }
}

/**
 * Opens `/creature-feature` and asserts the experience shell + first reveal panel.
 */
export async function openCreatureFeature(page: Page) {
  await installLandingNetworkMocks(page);
  await page.goto("/creature-feature", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("creature-feature-page")).toBeAttached();
  await expect(page.getByTestId("creature-feature-exit")).toBeVisible();
  await expect(page.getByTestId("creature-reveal")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("creature-feature-next")).toBeVisible();
}
