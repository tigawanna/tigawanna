/**
 * Curated portfolio categories for repository filtering.
 */
export const REPOSITORY_CATEGORIES = [
  { label: "Frontend", value: "frontend" },
  { label: "Backend", value: "backend" },
  { label: "Mobile", value: "mobile" },
  { label: "DevTools", value: "devtools" },
  { label: "Data", value: "data" },
  { label: "Full-stack", value: "fullstack" },
  { label: "Other", value: "other" },
] as const;

export type RepositoryCategory = (typeof REPOSITORY_CATEGORIES)[number]["value"];

const CATEGORY_VALUES = new Set<string>(REPOSITORY_CATEGORIES.map((entry) => entry.value));

/**
 * Narrows an unknown string to a known repository category.
 */
export function isRepositoryCategory(
  value: string | null | undefined,
): value is RepositoryCategory {
  return Boolean(value && CATEGORY_VALUES.has(value));
}

/**
 * Human label for a category value.
 */
export function repositoryCategoryLabel(value: RepositoryCategory): string {
  return REPOSITORY_CATEGORIES.find((entry) => entry.value === value)?.label ?? value;
}

/** Topic → category heuristics used when syncing from GitHub (only if category is empty). */
const TOPIC_CATEGORY_RULES: { category: RepositoryCategory; topics: string[] }[] = [
  {
    category: "mobile",
    topics: ["expo", "react-native", "flutter", "ios", "android", "mobile"],
  },
  {
    category: "data",
    topics: ["geojson", "gis", "maps", "data", "database", "sql", "analytics"],
  },
  {
    category: "devtools",
    topics: ["cli", "vite", "webpack", "eslint", "devtools", "dx", "tooling", "plugin"],
  },
  {
    category: "frontend",
    topics: ["react", "nextjs", "next-js", "vue", "svelte", "astro", "tailwind", "frontend", "ui"],
  },
  {
    category: "backend",
    topics: ["elysia", "nestjs", "express", "hono", "api", "backend", "graphql", "trpc"],
  },
  {
    category: "fullstack",
    topics: ["fullstack", "full-stack", "monorepo", "turborepo"],
  },
];

/**
 * Infers a curated category from GitHub topic tags.
 *
 * @param topics - Repository topic names (lowercase-insensitive).
 * @returns Best-matching category, or `other` when nothing matches.
 */
export function inferRepositoryCategory(topics: string[]): RepositoryCategory {
  const normalized = new Set(topics.map((topic) => topic.trim().toLowerCase()).filter(Boolean));

  for (const rule of TOPIC_CATEGORY_RULES) {
    if (rule.topics.some((topic) => normalized.has(topic))) {
      return rule.category;
    }
  }

  return "other";
}
