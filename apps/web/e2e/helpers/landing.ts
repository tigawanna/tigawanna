import { expect, type Locator, type Page } from "@playwright/test";
import { expected } from "../fixtures/expected";
import { installLandingNetworkMocks } from "./network";

const SECTION_SELECTORS = {
  about: "#about",
  skills: "#skills",
  projects: "#projects",
  blogs: "#blogs",
  infodiet: "#infodiet",
  journal: "#journal",
  contact: "#contact",
} as const;

export type LandingSectionId = keyof typeof SECTION_SELECTORS;

/**
 * Narrows a nav href id to a known landing section, or throws.
 */
export function assertLandingSectionId(id: string): asserts id is LandingSectionId {
  if (!(id in SECTION_SELECTORS)) {
    throw new Error(`Unknown landing section id: ${id}`);
  }
}

/**
 * Opens the landing page with network mocks installed and waits for the shell.
 */
export async function openLanding(page: Page) {
  await installLandingNetworkMocks(page);
  const landingPath = process.env.LANDING_PATH ?? "/";
  await page.goto(landingPath, { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("landing-page")).toBeVisible();
  await expect(page.getByTestId("landing-hero")).toBeVisible();
}

/**
 * Waits until a landing section exists in the DOM (may still be off-screen).
 */
export function sectionLocator(page: Page, id: LandingSectionId): Locator {
  return page.locator(SECTION_SELECTORS[id]);
}

/**
 * Asserts the section intersects the viewport below the fixed navbar.
 */
export async function expectSectionInView(page: Page, id: LandingSectionId) {
  const section = sectionLocator(page, id);
  await expect(section).toBeAttached();
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

  // Menu handlers only work after hydration — poll until the drawer opens.
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
 * Scrolls a section into view without relying on hash nav (for content asserts).
 */
export async function revealSection(page: Page, id: LandingSectionId) {
  const section = sectionLocator(page, id);
  await expect(section).toBeAttached({ timeout: 30_000 });
  await section.evaluate((el) => {
    el.scrollIntoView({ block: "start", behavior: "instant" });
  });
  await expect(section).toBeVisible();
}

/**
 * Asserts the post-hero stack cube + how-I-work shell always mounts
 * (even before those sections are scrolled into view).
 */
export async function expectUnderHeroSections(page: Page) {
  await expect(page.getByTestId("stack-cube")).toBeAttached({ timeout: 30_000 });
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
 *
 * Fractions come from Chrome DevTools sampling on a 1280×800 viewport
 * (travel = cubeHeight − vh ≈ 2400px): Web@0, Mobile@0.22, AI@0.65, Backend@0.98.
 */
export async function expectDesktopStackCubeScrollFaces(page: Page) {
  const cube = page.getByTestId("stack-cube-desktop");
  // Dynamic import — wait past the SSR fallback shell.
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
 * Scroll each sticky how-I-work segment into the stuck position and assert
 * the frontmost panel title updates (guards against a stuck-on-one-segment bug).
 *
 * Each panel is `h-svh`; scroll targets are aboutTop + index * vh + 12.
 */
export async function expectCurvedSectionsScrollThrough(page: Page) {
  const about = page.getByTestId("landing-how-i-work");
  await expect(about).toBeAttached({ timeout: 30_000 });

  const { top, vh } = await about.evaluate((el) => ({
    top: el.getBoundingClientRect().top + window.scrollY,
    vh: window.innerHeight,
  }));

  for (let index = 0; index < expected.howIWorkTitles.length; index++) {
    const title = expected.howIWorkTitles[index]!;
    await page.evaluate(
      ({ aboutTop, viewport, panelIndex }) => {
        window.scrollTo({ top: aboutTop + panelIndex * viewport + 12, behavior: "instant" });
      },
      { aboutTop: top, viewport: vh, panelIndex: index },
    );

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
 * Mobile: scroll each stack-face panel until its content pops in (circle reveal).
 * Face document tops are measured before any panel sticks.
 */
export async function expectMobileStackFacesPopIn(page: Page) {
  const mobile = page.getByTestId("stack-cube-mobile");
  await expect(mobile).toBeVisible();

  // Park at the mobile cube intro so face panels are still in normal flow.
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
    // First face has no clip reveal; later faces need ~0.55vh into the panel for content opacity.
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
 * Opens `/creature-feature` and asserts the experience shell + first reveal panel.
 */
export async function openCreatureFeature(page: Page) {
  await installLandingNetworkMocks(page);
  await page.goto("/creature-feature", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("creature-feature-page")).toBeAttached();
  await expect(page.getByTestId("creature-feature-exit")).toBeVisible();
  // Curtain intro finishes, then reveal panels mount.
  await expect(page.getByTestId("creature-reveal")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("creature-feature-next")).toBeVisible();
}

/**
 * Shared telltale content checks used by desktop + mobile smoke coverage.
 */
export async function expectCoreLandingContent(page: Page) {
  await expect(page.getByTestId("landing-hero")).toContainText(expected.heroName);
  await expect(page.getByTestId("landing-hero")).toContainText(expected.role);

  await expectUnderHeroSections(page);

  await revealSection(page, "about");
  await expect(page.getByTestId("landing-how-i-work")).toContainText(expected.aboutTitle);

  await revealSection(page, "skills");
  await expect(page.getByTestId("landing-tech-choices")).toContainText(expected.techChoice);

  await revealSection(page, "projects");
  await expect(page.getByTestId("landing-projects")).toBeVisible();
  await expect(page.getByTestId("project-card").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("landing-projects")).toContainText(expected.project.name);

  await revealSection(page, "blogs");
  await expect(page.getByTestId("landing-blogs")).toContainText(expected.article.title);

  await revealSection(page, "infodiet");
  await expect(page.getByTestId("landing-infodiet")).toContainText(expected.infoDiet.name);

  await revealSection(page, "journal");
  await expect(page.getByTestId("landing-journals")).toContainText(expected.lesson.title);

  await revealSection(page, "contact");
  await expect(page.getByTestId("contact-form")).toBeVisible();
  await expect(page.getByTestId("contact-email-copy")).toContainText(expected.email);
  await expect(page.getByTestId("landing-footer")).toContainText(expected.brand);
}
