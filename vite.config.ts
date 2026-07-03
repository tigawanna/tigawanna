import { defineConfig } from "vite-plus";

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
        files: ["apps/site/**"],
        plugins: ["typescript", "react"],
      },
    ],
  },
  staged: {
    "apps/site/**": "pnpm --filter site exec vp check --fix",
  },
});
