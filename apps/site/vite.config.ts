import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath, URL } from "url";
import { createLogger, defineConfig } from "vite-plus";
import { workflow } from "workflow/vite";

import tailwindcss from "@tailwindcss/vite";
import evlog from "evlog/vite";

const logger = createLogger();
const loggerWarn = logger.warn.bind(logger);

logger.warn = (msg, options) => {
  if (msg.includes("dynamic import cannot be analyzed") && msg.includes("#workflow/")) {
    return;
  }
  loggerWarn(msg, options);
};

const config = defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  customLogger: logger,
  server: {
    host: "::",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Ghost dep of @huggingface/transformers — pin to the site install so
      // Rolldown can resolve it from transformers.web.js under pnpm isolation.
      "onnxruntime-common": fileURLToPath(
        new URL("./node_modules/onnxruntime-common", import.meta.url),
      ),
    },
  },
  ssr: {
    // Browser WASM stack — never pull into the SSR graph.
    external: [
      "@huggingface/transformers",
      "onnxruntime-common",
      "onnxruntime-node",
      "onnxruntime-web",
    ],
  },
  optimizeDeps: {
    exclude: ["@huggingface/transformers", "onnxruntime-web"],
  },
  plugins: [
    workflow(),
    devtools(),
    evlog({ service: "tigawanna-site", sourceLocation: "dev" }),
    tanstackStart({
      router: {
        routeToken: "layout",
      },
      sitemap: {
        enabled: true,
        host: "https://www.tigawanna.vip",
      },
    }),
    nitro(),
    tailwindcss(),
    viteReact(),
  ],
});

export default config;
