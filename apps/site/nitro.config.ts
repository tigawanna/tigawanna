import { defineConfig } from "nitro";
import evlog from "evlog/nitro/v3";

export default defineConfig({
  experimental: {
    asyncContext: true,
  },
  plugins: ["./server/plugins/evlog-fs-drain.ts"],
  modules: [
    evlog({
      env: { service: "tigawanna-site" },
      enabled: process.env.NODE_ENV !== "production",
    }),
  ],
});
