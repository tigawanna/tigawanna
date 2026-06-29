import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath, URL } from "url";
import { createLogger, defineConfig } from "vite-plus";
import { workflow } from "workflow/vite";

import tailwindcss from "@tailwindcss/vite";

const logger = createLogger();
const loggerWarn = logger.warn.bind(logger);

logger.warn = (msg, options) => {
  if (msg.includes("dynamic import cannot be analyzed") && msg.includes("#workflow/")) {
    return;
  }
  loggerWarn(msg, options);
};

const config = defineConfig({
  customLogger: logger,
  fmt: {
    ignorePatterns: ["**/routeTree.gen.ts"],
  },
  server: {
    host: "::",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    workflow(),
    devtools(),
    tanstackStart({
      router: {
        routeToken: "layout",
      },
    }),
    nitro(),
    tailwindcss(),
    viteReact(),
  ],
});

export default config;
