import { siteConfig } from "@/config/site";

function absoluteAsset(path: string) {
  return `${siteConfig.links.website}${path}`;
}

export const AppConfig = {
  name: siteConfig.name,
  brief: siteConfig.role,
  description: siteConfig.description,
  logo: {
    src: siteConfig.assets.ogImage,
    alt: siteConfig.assets.ogImageAlt,
    href: "/",
  },
  themeStorageKey: "tigawanna.theme",
  links: siteConfig.links,
  navItems: siteConfig.navItems,
  techSkills: siteConfig.techSkills,
  assets: siteConfig.assets,
  absoluteAsset,
};
