import stylexPlugin from "unplugin-stylex/rolldown";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsdown";

const root = dirname(fileURLToPath(import.meta.url));

/**
 * Refresh concatenated CSS (dist + Ladle public) after each emit.
 * @see https://tsdown.dev/options/dts
 * @see https://tsdown.dev/advanced/plugins
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

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  outDir: "dist",
  sourcemap: true,
  tsconfig: "./tsconfig.build.json",
  exports: {
    customExports(exports) {
      const { ["./stylex.css"]: _stylex, ...rest } = exports;
      return {
        ...rest,
        "./styles.css": "./dist/styles.css",
      };
    },
  },
  deps: {
    neverBundle: ["react", "react-dom", "react/jsx-runtime", "@stylexjs/stylex", /@astryxdesign\//],
  },
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
