import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  clean: true,
  dts: false,
  deps: {
    alwaysBundle: ["@repo/db"],
    neverBundle: ["@kessler/gemma-embedding", "onnxruntime-node"],
  },
});
