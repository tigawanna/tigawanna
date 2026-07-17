import { cloudflare } from "@cloudflare/vite-plugin";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite-plus";

import tailwindcss from "@tailwindcss/vite";
import evlog from "evlog/vite";

const config = defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  server: {
    host: true,
    port: 3046,
    hmr: {
      host: "localhost",
      port: 3046,
    },
  },
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/react-router"],
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    devtools(),
    evlog({ service: "tigawanna-site", sourceLocation: "dev" }),
    tanstackStart({
      router: {
        routeToken: "layout",
      },
    }),
    tailwindcss(),
    viteReact(),
  ],
});

export default config;
