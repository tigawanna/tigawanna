import stylexPlugin from "unplugin-stylex/rolldown";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "rolldown";

const root = dirname(fileURLToPath(import.meta.url));

/**
 * Refresh concatenated CSS (dist + Ladle public) after each Rolldown emit.
 */
function rebuildCss() {
  return {
    name: "rebuild-credit-css",
    writeBundle() {
      spawnSync(process.execPath, [join(root, "scripts/build-css.mjs")], {
        cwd: root,
        stdio: "inherit",
      });
    },
  };
}

/**
 * Library build via Rolldown + unplugin-stylex (native Rolldown adapter).
 * @see https://rolldown.rs/guide/getting-started
 * @see https://github.com/eryue0220/unplugin-stylex
 */
export default defineConfig({
  input: "src/index.ts",
  tsconfig: "./tsconfig.json",
  platform: "neutral",
  output: [
    {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
  ],
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "@stylexjs/stylex",
    /^@astryxdesign\//,
  ],
  plugins: [
    stylexPlugin({
      stylex: {
        filename: "stylex.css",
        useCSSLayers: true,
        treeshakeCompensation: true,
        runtimeInjection: false,
      },
    }),
    rebuildCss(),
  ],
});
