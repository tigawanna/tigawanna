import {
  howIWorkSections,
  howIWorkSummary,
  siteConfig,
  siteSeoKeywords,
  stackCubeFaces,
  techChoices,
} from "@repo/site-constants";

export type CompactSiteProfile = {
  name: string;
  role: string;
  location: string;
  website: string;
  summary: string;
  howIWork: { id: string; tag: string; title: string; body: string }[];
  stack: { label: string; techs: readonly string[] }[];
  primaryTech: { name: string; category: string; position: string }[];
  contact: {
    email: string;
    github: string;
    linkedin: string;
    devto: string;
    twitter: string;
  };
  keywords: string;
};

export function getCompactSiteProfile(): CompactSiteProfile {
  return {
    name: siteConfig.name,
    role: siteConfig.role,
    location: "Nairobi, Kenya",
    website: siteConfig.links.website,
    summary: howIWorkSummary,
    howIWork: howIWorkSections.map((section) => ({
      id: section.id,
      tag: section.tag,
      title: section.title,
      body: section.body,
    })),
    stack: stackCubeFaces.map((face) => ({
      label: face.label,
      techs: face.techs,
    })),
    primaryTech: techChoices.map((tech) => ({
      name: tech.name,
      category: tech.category,
      position: tech.position,
    })),
    contact: {
      email: siteConfig.links.email,
      github: siteConfig.links.github,
      linkedin: siteConfig.links.linkedin,
      devto: siteConfig.links.devto,
      twitter: siteConfig.links.twitter,
    },
    keywords: siteSeoKeywords,
  };
}
