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
  links: {
    github: string;
    linkedin: string;
    twitter: string;
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
  links: {
    github: siteConfig.links.github,
    linkedin: siteConfig.links.linkedin,
    twitter: siteConfig.links.twitter,
    website: siteConfig.links.website,
    email: siteConfig.links.email,
    emailTo: siteConfig.links.emailTo,
    devto: siteConfig.links.devto,
  },
};

export type CreditLinkKey = keyof CreditProfile["links"];
