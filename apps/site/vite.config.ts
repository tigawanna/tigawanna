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
    },
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
