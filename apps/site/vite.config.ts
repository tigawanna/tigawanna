import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite-plus";
import { workflow } from "workflow/vite";

import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
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
