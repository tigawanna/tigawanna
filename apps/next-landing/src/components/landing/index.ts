export { LandingPage } from "./LandingPage";

export { LandingNavbar } from "./layout/LandingNavbar";
export { LandingFooter } from "./layout/LandingFooter";
export { LandingScrollFab } from "./layout/LandingScrollFab";
export { LandingScrollFabDeferred } from "./layout/LandingScrollFabDeferred";
export { LandingHero } from "./sections/hero/LandingHero";
export { LandingHowIWork } from "./sections/about/LandingHowIWork";
export { LandingFeaturesDeferred } from "./sections/features/LandingFeaturesDeferred";
export { LandingProjects } from "./sections/projects/LandingProjects";
export { LandingArticles } from "./sections/articles/LandingArticles";
export { LandingInfodiet } from "./sections/infodiet/LandingInfodiet";
export { LandingJournalsDeferred } from "./sections/journals/LandingJournalsDeferred";
export { LandingCTA } from "./sections/contact/LandingCTA";
export { StackCubeDeferred } from "./sections/stack-cube/StackCubeDeferred";

export { JournalCard } from "./cards/JournalCard";
export { LessonCard } from "./cards/JournalCard";
export { PortfolioGridSkeleton } from "./cards/PortfolioGridSkeleton";
export { contactFormSchema, type ContactFormValues } from "./sections/contact/contact-schema";
export type { JournalPreviewItem } from "@/types/journals";
export type { LessonPreviewItem } from "./types/lessons";

export { getScrollRestorationKey } from "./utils/scroll-restoration-key";

export { AppConfig } from "./config/system";
export { siteConfig } from "./config/site";
export * from "./config/info";
export {
  STATIC_ARTICLES,
  STATIC_LESSONS,
  STATIC_PINNED_PROJECTS,
  STATIC_RECENT_PROJECTS,
} from "./data/static";
