import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite-plus";
import { workflow } from "workflow/vite";

import tailwindcss from "@tailwindcss/vite";

const botIdBase = "/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3";

const config = defineConfig({
  fmt: {
    ignorePatterns: ["**/routeTree.gen.ts"],
  },
  server: {
    host: "::",
    proxy: {
      [`${botIdBase}/a-4-a/c.js`]: {
        target: "https://api.vercel.com",
        changeOrigin: true,
        rewrite: () => "/bot-protection/v1/challenge",
      },
      [botIdBase]: {
        target: "https://api.vercel.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(botIdBase, "/bot-protection/v1/proxy"),
      },
    },
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
