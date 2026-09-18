/**
 * Slim profile snapshot baked from `@repo/site-constants` at build time.
 * Consumers of the published package do not depend on the private workspace package.
 */
import { siteConfig } from "@repo/site-constants/site";

export type CreditProfile = {
  name: string;
  title: string;
  brand: string;
  role: string;
  description: string;
  locationLabel: string;
  location: string;
  tagline: string;
  contactBlurb: string;
  /** Absolute avatar URL so embeds on other origins still resolve. */
  avatarUrl: string;
  links: {
    github: string;
    linkedin: string;
    x: string;
    website: string;
    email: string;
    emailTo: string;
    devto: string;
  };
};

export const creditProfile: CreditProfile = {
  name: siteConfig.name,
  title: siteConfig.title,
  brand: siteConfig.brand,
  role: siteConfig.role,
  description: siteConfig.description,
  locationLabel: siteConfig.locationLabel,
  location: siteConfig.location,
  tagline: siteConfig.tagline,
  contactBlurb: siteConfig.contactBlurb,
  avatarUrl: new URL(siteConfig.assets.avatar, `${siteConfig.links.website}/`).href,
  links: {
    github: siteConfig.links.github,
    linkedin: siteConfig.links.linkedin,
    x: siteConfig.links.x,
    website: siteConfig.links.website,
    email: siteConfig.links.email,
    emailTo: siteConfig.links.emailTo,
    devto: siteConfig.links.devto,
  },
};

export type CreditLinkKey = keyof CreditProfile["links"];
