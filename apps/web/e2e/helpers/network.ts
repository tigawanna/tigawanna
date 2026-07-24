import type { Page, Route } from "@playwright/test";

/** 1x1 transparent PNG — fulfills remote image requests without network. */
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const EXTERNAL_HOST_PATTERN =
  /^(api\.github\.com|raw\.githubusercontent\.com|media2?\.dev\.to|dev\.to|www\.googletagmanager\.com|www\.google-analytics\.com|us\.i\.posthog\.com|app\.posthog\.com|api\.telegram\.org|opengraph\.githubassets\.com|avatars\.githubusercontent\.com)/i;

/**
 * Blocks third-party browser network I/O for stable offline e2e runs.
 * web serves static fixtures in-process, so no server-fn stubs needed.
 */
export async function installLandingNetworkMocks(page: Page) {
  await page.route("**/*", async (route: Route) => {
    const request = route.request();
    const url = new URL(request.url());
    const resourceType = request.resourceType();

    if (EXTERNAL_HOST_PATTERN.test(url.hostname)) {
      if (resourceType === "image" || url.pathname.match(/\.(png|jpe?g|webp|gif|svg)(\?|$)/i)) {
        await route.fulfill({ status: 200, contentType: "image/png", body: TRANSPARENT_PNG });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ mocked: true }),
      });
      return;
    }

    await route.continue();
  });
}
