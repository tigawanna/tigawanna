export type InfoCard = {
  tag: string;
  title: string;
  body: string;
};

export type StackCubeFace = {
  label: string;
  techs: readonly string[];
};

export const stackCubeFaces = [
  {
    label: "Web",
    techs: [
      "React",
      "Next.js",
      "TanStack Start",
      "HTML",
      "Tailwind CSS",
      "TypeScript",
      "CSS",
      "Responsive design",
    ],
  },
  {
    label: "Mobile",
    techs: ["React Native", "Expo", "Zustand", "Capacitor", "PWA", "TypeScript"],
  },
  {
    label: "AI",
    techs: ["RAG", "RAG pipelines", "Chatbots", "Models", "Local data preservation", "Embeddings"],
  },
  {
    label: "Backend",
    techs: [
      "Firebase",
      "Supabase",
      "Node.js",
      "Docker",
      "AWS",
      "GCP",
      "Cloudflare Workers",
      "Drizzle ORM",
    ],
  },
] as const satisfies readonly StackCubeFace[];

export const howIWorkCards = [
  {
    tag: "Ownership",
    title: "End-to-end project ownership",
    body: "Architecture through deployment — and the long tail after launch. I stay accountable for the whole arc, not just my slice of it.",
  },
  {
    tag: "Architecture",
    title: "System design & direction",
    body: "Data modeling, stack decisions, and architecture reviews before you commit. I help teams choose paths they can live with.",
  },
  {
    tag: "Teams",
    title: "Team multiplier",
    body: "Led frontend teams, mentored juniors, tightened CI, and left codebases easier to onboard than I found them.",
  },
  {
    tag: "Quality",
    title: "Maintainable by default",
    body: "Performance-minded implementations, sensible tests, and code review habits that catch issues before they ship.",
  },
  {
    tag: "Partnership",
    title: "Cross-functional collaborator",
    body: "Comfortable across product, design, and engineering — translating constraints in both directions so the work actually lands.",
  },
  {
    tag: "Open source",
    title: "Contributor & user",
    body: "I enjoy open source and give back where I can — fixes, docs, and small contributions to the tools and libraries teams rely on every day.",
  },
] as const satisfies readonly InfoCard[];

export const howIWorkSummary =
  "I own projects from architecture through deployment, designing systems teams can live with and shipping maintainable, performance-minded code. Along the way I mentor teams, collaborate across product and design, and give back to open source.";

export const howIWorkSections = [
  {
    id: "ownership",
    tag: "Ownership",
    title: "End-to-end project ownership",
    body: "From architecture through deployment and the long tail after launch. I stay accountable for the whole arc, not just my slice.",
    background: "#1b2215",
    foreground: "#d6d0b7",
  },
  {
    id: "architecture",
    tag: "Architecture",
    title: "System design & direction",
    body: "Data modeling, stack decisions, and reviews before you commit. I help teams choose paths they can live with.",
    background: "#404b38",
    foreground: "#d6d0b7",
  },
  {
    id: "teams",
    tag: "Teams",
    title: "Team multiplier",
    body: "I lead, mentor, and collaborate across product, design, and engineering, translating constraints so the work actually lands.",
    background: "#2b3422",
    foreground: "#d6d0b7",
  },
  {
    id: "open-source",
    tag: "Open source",
    title: "Contributor & builder",
    body: "Maintainable code by default, open source contributions, and tools built on the fly: CLIs, Chrome extensions, web apps, and MCPs that remove friction and multiply what a team can ship.",
    background: "#4a5543",
    foreground: "#d6d0b7",
  },
] as const;
