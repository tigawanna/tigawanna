import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite-plus";

import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  server: {
    host: "::",
  },
  optimizeDeps: {
    include: ["@tanstack/ai", "@tanstack/ai-react", "@tanstack/ai-openrouter"],
  },
  ssr: {
    noExternal: ["@tanstack/ai", "@tanstack/ai-react", "@tanstack/ai-openrouter"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    devtools(),
    // this is the plugin that enables path aliases
    tailwindcss(),
    tanstackStart({
      router: {
        routeToken: "layout", // <-- Add this line
      },
    }),
    viteReact(),
  ],
});

export default config;
