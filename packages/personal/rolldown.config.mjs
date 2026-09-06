import stylexPlugin from "unplugin-stylex/rolldown";
import { defineConfig } from "rolldown";

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
  ],
});
