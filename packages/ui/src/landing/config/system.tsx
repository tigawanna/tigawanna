import { siteConfig } from "./site";
import { siteSeoDescription, siteSeoKeywords, siteSeoOgImageAlt, siteSeoTitle } from "./info";
import { Code2 } from "lucide-react";

function absoluteAsset(path: string) {
  return `${siteConfig.links.website}${path}`;
}

export const AppConfig = {
  name: siteConfig.name,
  brief: siteConfig.role,
  description: siteConfig.description,
  icon: Code2,
  logo: {
    src: siteConfig.assets.ogImage,
    alt: siteSeoOgImageAlt,
    href: "/",
  },
  themeStorageKey: "tigawanna.theme",
  links: siteConfig.links,
  navItems: siteConfig.navItems,
  techSkills: siteConfig.techSkills,
  assets: siteConfig.assets,
  absoluteAsset,
  seo: {
    title: siteSeoTitle,
    description: siteSeoDescription,
    keywords: siteSeoKeywords,
    ogImageAlt: siteSeoOgImageAlt,
  },
};
