import { configDefaults, defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    ignorePatterns: ["**/routeTree.gen.ts"],
  },
  lint: {
    ignorePatterns: ["apps/legacy-next/**"],
    plugins: ["typescript"],
    options: { typeAware: true, typeCheck: true },
    overrides: [
      {
        files: ["apps/web/**"],
        plugins: ["typescript", "react", "nextjs"],
      },
    ],
  },
  test: {
    // Unit tests only — Playwright lives in **/e2e/** as *.spec.ts and must not run under Vitest.
    include: ["**/*.test.{ts,tsx}"],
    exclude: [
      ...configDefaults.exclude,
      "**/e2e/**",
      "**/dist/**",
      "**/playwright-report/**",
      "**/test-results/**",
    ],
  },
  // Pre-commit only (vp staged). Pre-push is not expressible here — see .vite-hooks/pre-push.
  staged: {
    "apps/web/**": "pnpm --filter web exec vp check --fix",
  },
});
