import type { TechChoice } from "@/types/tech-choices";

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
    techs: ["React", "Next.js", "TanStack", "Tailwind CSS", "TypeScript"],
  },
  {
    label: "Mobile",
    techs: ["React Native", "Expo", "Capacitor", "PWA", "TypeScript"],
  },
  {
    label: "AI",
    techs: ["RAG", "Chatbots", "Workflows", "Agents"],
  },
  {
    label: "Backend",
    techs: ["Node.js", "Docker", "AWS", "GCP", "Cloudflare", "Linux Servers", "Supabase"],
  },
] as const satisfies readonly StackCubeFace[];

export const howIWorkCards = [
  {
    tag: "Ownership",
    title: "End-to-end project ownership",
    body: "Architecture through deployment and the work after launch. I stay accountable for the entire lifecycle, not just my part.",
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
    body: "Comfortable across product, design, and engineering, connecting needs across teams so the work actually lands.",
  },
  {
    tag: "Open source",
    title: "Contributor & user",
    body: "I enjoy open source and give back where I can with fixes, docs, and contributions to core tools and libraries.",
  },
] as const satisfies readonly InfoCard[];

export const howIWorkSummary =
  "I own projects from architecture through deployment, designing systems teams can live with and shipping maintainable, performance-minded code. Along the way I mentor teams, collaborate across product and design, and give back to open source.";

export const howIWorkSections = [
  {
    id: "ownership",
    tag: "Ownership",
    title: "End-to-end project ownership",
    body: "From architecture through deployment and the work after launch. I stay accountable for the entire lifecycle, not just my part.",
    background: "var(--color-landing-face-1)",
    foreground: "var(--color-landing-cream-bg)",
  },
  {
    id: "architecture",
    tag: "Architecture",
    title: "System design & direction",
    body: "Data modeling, stack decisions, and reviews before you commit. I help teams choose paths they can live with.",
    background: "var(--color-landing-face-2)",
    foreground: "var(--color-landing-cream-bg)",
  },
  {
    id: "teams",
    tag: "Teams",
    title: "Team multiplier",
    body: "I lead, mentor, and collaborate across product, design, and engineering, translating constraints so the work actually lands.",
    background: "var(--color-landing-face-3)",
    foreground: "var(--color-landing-cream-bg)",
  },
  {
    id: "open-source",
    tag: "Open source",
    title: "Contributor & builder",
    body: "Maintainable code by default, open source contributions, and tools built on the fly: CLIs, Chrome extensions, web apps, and MCPs that remove friction and multiply what a team can ship.",
    background: "var(--color-landing-face-4)",
    foreground: "var(--color-landing-cream-bg)",
  },
] as const;

export const techChoices = [
  {
    id: "next",
    name: "Next.js",
    shortName: "Next",
    category: "React framework",
    position: "Server-first default",
    summary:
      "I reach for Next.js when a product needs the safest React deployment path, mature rendering primitives, and a large ecosystem around the edges.",
    reason:
      "It wraps React with a strong server-first model, great routing conventions, ISR, image handling, and enough industry gravity that teams rarely need to explain the choice.",
    strengths: ["SSR", "ISR", "App Router", "Platform maturity"],
  },
  {
    id: "tanstack-start",
    name: "TanStack Start",
    shortName: "Start",
    category: "React framework",
    position: "Client-comfort SSR",
    summary:
      "TanStack Start is where I go when I want server rendering without giving up the client-first mental model I like for product interfaces.",
    reason:
      "It keeps the TanStack Router ergonomics, pairs naturally with Query, and gives SSR/server functions while still feeling like a React app instead of a framework ceremony.",
    strengths: ["SSR", "Server functions", "Typed routing", "Query-native"],
  },
  {
    id: "react",
    name: "React",
    shortName: "React",
    category: "UI runtime",
    position: "Composable interface core",
    summary:
      "React remains my base layer for interfaces because the component model is boring in the best way and the ecosystem is still unmatched.",
    reason:
      "It gives me a predictable way to build reusable UI, pair with typed data tools, and ship across web and native surfaces without changing how I think about product state.",
    strengths: ["Components", "React 19", "Compiler", "Ecosystem"],
  },
  {
    id: "typescript",
    name: "TypeScript",
    shortName: "TS",
    category: "Language",
    position: "Executable contracts",
    summary:
      "TypeScript is the discipline layer. I use it to make intent explicit before bugs get a chance to become runtime surprises.",
    reason:
      "Strict types keep API boundaries honest, make refactors less dramatic, and let the editor become a design tool for the system instead of a spellchecker.",
    strengths: ["Strict contracts", "Refactors", "DX", "API safety"],
  },
  {
    id: "tanstack-router",
    name: "TanStack Router",
    shortName: "Router",
    category: "Routing",
    position: "Typed navigation",
    summary:
      "I like TanStack Router when routes should behave like part of the type system instead of a string map that can drift.",
    reason:
      "File routing, loaders, search params, and route context become easier to reason about when navigation is typed from the route tree outward.",
    strengths: ["File routes", "Typed params", "Loaders", "Route context"],
  },
  {
    id: "tanstack-query",
    name: "TanStack Query",
    shortName: "Query",
    category: "Async state",
    position: "Server state boundary",
    summary:
      "TanStack Query is the clean separation between remote data and local UI state, which keeps components from turning into fetch lifecycle machines.",
    reason:
      "It handles caching, invalidation, suspense, retries, and loading/error behavior in a way that scales from tiny pages to serious product surfaces.",
    strengths: ["Caching", "Invalidation", "Suspense", "Async UX"],
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    shortName: "Tailwind",
    category: "Styling",
    position: "Fast visual systems",
    summary:
      "Tailwind helps me move quickly without inventing one-off CSS names for every small layout decision.",
    reason:
      "The utility model keeps styling close to the markup, while design tokens and shared components still give the system enough structure to stay consistent.",
    strengths: ["Tokens", "Responsive UI", "Velocity", "Consistency"],
  },
  {
    id: "drizzle",
    name: "Drizzle ORM",
    shortName: "Drizzle",
    category: "Data layer",
    position: "SQL with types",
    summary:
      "I use Drizzle when I want the database to stay visible instead of hiding everything behind a heavy abstraction.",
    reason:
      "It keeps SQL close, types the schema, works well with migrations, and makes data access feel explicit without losing developer speed.",
    strengths: ["Typed schema", "Migrations", "SQL-first", "Lightweight"],
  },
  {
    id: "cloudflare-workers",
    name: "Cloudflare Workers",
    shortName: "Workers",
    category: "Runtime",
    position: "Edge delivery",
    summary:
      "Workers are useful when the product benefits from small, fast server logic close to the user.",
    reason:
      "They make APIs, middleware, webhooks, and edge workloads cheap to deploy and fast to reach, especially for compact TypeScript services.",
    strengths: ["Edge runtime", "Fast APIs", "Webhooks", "Low overhead"],
  },
  {
    id: "react-native",
    name: "React Native",
    shortName: "Native",
    category: "Mobile",
    position: "Shared product thinking",
    summary:
      "React Native lets me carry React product architecture onto mobile without pretending the platforms are identical.",
    reason:
      "It keeps enough shared mental model to move fast, while still leaving room for native navigation, device APIs, and platform-specific polish where it matters.",
    strengths: ["Mobile UI", "Expo", "Shared model", "Native APIs"],
  },
] as const satisfies readonly TechChoice[];
