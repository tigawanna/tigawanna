import { siteConfig } from "@repo/site-constants/site";

/**
 * Slim profile snapshot baked from `@repo/site-constants` at build time.
 * Consumers of the published package do not depend on the private workspace package.
 */
export const creditProfile = {
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
} as const;

export type CreditProfile = typeof creditProfile;

export type CreditLinkKey = keyof typeof creditProfile.links;
