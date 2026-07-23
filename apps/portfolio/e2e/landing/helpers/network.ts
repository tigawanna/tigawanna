import type { Page, Route } from "@playwright/test";
import {
  mockRepoDetailResult,
  mockRepoReadmeHtml,
  mockViewerReposResult,
} from "../fixtures/github";

/** 1x1 transparent PNG — fulfills remote image requests without network. */
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const EXTERNAL_HOST_PATTERN =
  /^(api\.github\.com|raw\.githubusercontent\.com|media2?\.dev\.to|dev\.to|www\.googletagmanager\.com|www\.google-analytics\.com|us\.i\.posthog\.com|app\.posthog\.com|api\.telegram\.org)/i;

/**
 * Fulfills a TanStack Start server-fn JSON envelope.
 */
function serverFnJson(result: unknown) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      result,
      error: null,
      context: {},
    }),
  };
}

/**
 * Decodes TanStack Start's base64url server-fn id (`/_serverFn/<id>`).
 */
function decodeServerFnId(pathname: string): string {
  const id = pathname.replace(/^\/_serverFn\//, "").split("/")[0] ?? "";
  try {
    return Buffer.from(id, "base64url").toString("utf8");
  } catch {
    try {
      return Buffer.from(id, "base64").toString("utf8");
    } catch {
      return id;
    }
  }
}

/**
 * Blocks third-party browser network I/O and stubs portfolio server functions.
 *
 * Repo list / detail server-fns are identified from the encoded export name in
 * the URL so e2e never depends on live GitHub.
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

    if (url.pathname.startsWith("/_serverFn/")) {
      if (request.method() === "POST") {
        await route.fulfill(serverFnJson({ success: true }));
        return;
      }

      const decoded = decodeServerFnId(url.pathname);

      if (
        decoded.includes("getPinnedRepos") ||
        decoded.includes("getRecentRepos") ||
        (decoded.includes("repos.ts") && !decoded.includes("repo-detail"))
      ) {
        await route.fulfill(serverFnJson(mockViewerReposResult));
        return;
      }

      if (decoded.includes("getRepoDetail")) {
        await route.fulfill(serverFnJson(mockRepoDetailResult()));
        return;
      }

      if (decoded.includes("getRepoReadmeHtml") || decoded.includes("fetchRepoReadmeHtml")) {
        await route.fulfill(serverFnJson(mockRepoReadmeHtml()));
        return;
      }

      await route.continue();
      return;
    }

    await route.continue();
  });
}
