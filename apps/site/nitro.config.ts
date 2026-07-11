import { defineConfig } from "nitro";
import evlog from "evlog/nitro/v3";

/**
 * Gemma embedding (via `@huggingface/transformers`) is browser-only.
 * Keep onnxruntime / transformers out of the Nitro server bundle — they pull
 * native binaries and a ghost `onnxruntime-common` import that Rolldown cannot
 * resolve during SSR packaging.
 */
const embeddingExternals = [
  "@huggingface/transformers",
  "@kessler/gemma-embedding",
  "@repo/gemma-embedding",
  "onnxruntime-common",
  "onnxruntime-node",
  "onnxruntime-web",
] as const;

export default defineConfig({
  experimental: {
    asyncContext: true,
  },
  modules: [
    evlog({
      env: { service: "tigawanna-site" },
    }),
  ],
  rolldownConfig: {
    external: [...embeddingExternals],
  },
  rollupConfig: {
    external: [...embeddingExternals],
  },
});
