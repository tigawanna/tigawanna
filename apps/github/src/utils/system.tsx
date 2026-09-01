import { getAppUrl } from "@/lib/envs/client-env";
import { Github } from "lucide-react";

const appName = "GitHub Dashboard";
const appBrief = "Browse repos & stars";
const appDescription =
  "An ergonomic dashboard for browsing GitHub repositories and starred projects.";
const seoKeywords =
  "github, repositories, stars, dashboard, tigawanna, open source";

const assets = {
  favicon: "/favicon.ico",
  appleTouchIcon: "/apple-touch-icon.png",
  icon: "/icon.png",
  ogImage: "/opengraph-image.jpg",
  ogImageAlt: "tigawanna GitHub dashboard preview",
} as const;

const links = {
  github: "https://github.com/tigawanna",
  email: "denniskinuthiawaweru@gmail.com",
  emailTo: "mailto:denniskinuthiawaweru@gmail.com",
  website: getAppUrl(),
} as const;

/**
 * Resolves a site asset path against this app's configured origin.
 */
function absoluteAsset(path: string) {
  return `${getAppUrl()}${path}`;
}

export const AppConfig = {
  name: appName,
  brief: appBrief,
  description: appDescription,
  icon: Github,
  logo: {
    src: assets.ogImage,
    alt: assets.ogImageAlt,
    href: "/",
  },
  themeStorageKey: "tigawanna.github.theme",
  links,
  navItems: [
    { label: "Overview", href: "#overview" },
    { label: "Pinned", href: "#pinned" },
    { label: "Recent", href: "#recent" },
    { label: "Starred", href: "#starred" },
  ],
  assets,
  absoluteAsset,
  seo: {
    title: `${appName} | tigawanna`,
    description: appDescription,
    keywords: seoKeywords,
    ogImageAlt: assets.ogImageAlt,
  },
} as const;
