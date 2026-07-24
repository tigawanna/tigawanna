import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  /** Cache Components: static shell + selective `use cache` / PPR-style streaming. */
  cacheComponents: true,
  transpilePackages: ["@repo/site-constants"],
  experimental: {
    /** React View Transitions for App Router navigations. */
    viewTransition: true,
  },
  images: {
    localPatterns: [
      {
        pathname: "/api/media/file/**",
      },
      {
        pathname: "/opengraph-image.jpg",
      },
      {
        pathname: "/icon.png",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media2.dev.to",
      },
      {
        protocol: "https",
        hostname: "opengraph.githubassets.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    return webpackConfig;
  },
  turbopack: {
    // Monorepo: resolve from workspace root so Next/payload packages hoist correctly.
    root: path.resolve(dirname, "../.."),
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
