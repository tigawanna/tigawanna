import { defineConfig } from "nitro";

export default defineConfig({
  /**
   * libsql uses dynamic `require('@libsql/<platform>')` for local file DB.
   * Force-trace native bindings so Vercel serverless functions can load them when needed.
   */
  traceDeps: ["@libsql/linux-x64-gnu", "@libsql/linux-x64-musl"],
  experimental: {
    asyncContext: true,
  },
});
