import { siteConfig } from "@/config/site";

export const AppConfig = {
  name: siteConfig.name,
  brief: siteConfig.role,
  description: siteConfig.description,
  logo: {
    src: "/moi.jpg",
    alt: siteConfig.title,
    href: "/",
  },
  themeStorageKey: "tigawanna.theme",
  links: siteConfig.links,
  navItems: siteConfig.navItems,
  techSkills: siteConfig.techSkills,
};
