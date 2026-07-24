import { cloudflare } from "@cloudflare/vite-plugin";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite-plus";

import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  server: {
    host: true,
    port: 3045,
    hmr: {
      host: "localhost",
      port: 3045,
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
    tanstackStart({
      router: {
        routeToken: "layout",
      },
      sitemap: {
        enabled: true,
        host: "https://www.tigawanna.vip",
      },
      // https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering
      prerender: {
        enabled: true,
        autoSubfolderIndex: true,
        autoStaticPathsDiscovery: true,
        crawlLinks: true,
        concurrency: 14,
        retryCount: 2,
        retryDelay: 1000,
        maxRedirects: 5,
        failOnError: true,
        // Skip e2e landing alias and OG image endpoint if crawled
        filter: ({ path }) => !path.startsWith("/og"),
      },
    }),
    tailwindcss(),
    viteReact(),
  ],
});

export default config;
