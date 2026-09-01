import type { DevtoArticle } from "@/types/devto";
import type { GithubRepoNode } from "@/types/github";
import type { LessonItem, LessonPreviewItem, LessonsPreviewPage } from "@/types/lessons";
import { formatDisplayDate } from "@/utils/date-helpers";

function repo(
  overrides: Partial<GithubRepoNode> &
    Pick<GithubRepoNode, "name" | "nameWithOwner" | "description">,
): GithubRepoNode {
  return {
    url: `https://github.com/${overrides.nameWithOwner}`,
    openGraphImageUrl: "/opengraph-image.jpg",
    descriptionHTML: "",
    homepageUrl: "",
    pushedAt: "2026-03-01T10:00:00Z",
    isPrivate: false,
    repositoryTopics: { nodes: [] },
    ...overrides,
  };
}

function topics(...names: string[]) {
  return { nodes: names.map((name) => ({ topic: { name } })) };
}

export const STATIC_PINNED_PROJECTS: GithubRepoNode[] = [
  repo({
    name: "tigawanna",
    nameWithOwner: "tigawanna/tigawanna",
    description:
      "Full-stack TypeScript monorepo — TanStack Start site, Elysia API, Expo apps, and shared packages.",
    homepageUrl: "https://tigawanna-portfolio.vercel.app",
    pushedAt: "2026-06-20T14:30:00Z",
    repositoryTopics: topics("typescript", "tanstack", "elysia", "monorepo"),
  }),
  repo({
    name: "expo-widget-bridge",
    nameWithOwner: "tigawanna/expo-widget-bridge",
    description:
      "Android home-screen widgets powered by custom Expo native modules and Jetpack Compose.",
    pushedAt: "2026-05-12T09:15:00Z",
    repositoryTopics: topics("expo", "react-native", "android", "typescript"),
  }),
  repo({
    name: "tanstack-theme-kit",
    nameWithOwner: "tigawanna/tanstack-theme-kit",
    description:
      "SSR-friendly theme provider for TanStack Start with DaisyUI and zero flash on load.",
    pushedAt: "2026-04-28T16:45:00Z",
    repositoryTopics: topics("react", "tanstack", "theming", "ssr"),
  }),
];

export const STATIC_RECENT_PROJECTS: GithubRepoNode[] = [
  ...STATIC_PINNED_PROJECTS,
  repo({
    name: "elysia-treaty-starter",
    nameWithOwner: "tigawanna/elysia-treaty-starter",
    description: "End-to-end type-safe API boilerplate with Elysia, Eden Treaty, and Better Auth.",
    pushedAt: "2026-06-10T11:20:00Z",
    repositoryTopics: topics("elysia", "typescript", "better-auth", "api"),
  }),
  repo({
    name: "vite-plugin-graphql-usage",
    nameWithOwner: "tigawanna/vite-plugin-graphql-usage",
    description: "Vite plugin that surfaces GraphQL operation usage across a codebase during dev.",
    pushedAt: "2026-05-26T09:36:00Z",
    repositoryTopics: topics("graphql", "vite", "typescript", "devtools"),
  }),
  repo({
    name: "channex-sync",
    nameWithOwner: "tigawanna/channex-sync",
    description: "Channel manager sync service for hospitality inventory, rates, and availability.",
    pushedAt: "2026-05-01T08:00:00Z",
    repositoryTopics: topics("nodejs", "api", "hospitality", "typescript"),
  }),
  repo({
    name: "client-portal",
    nameWithOwner: "tigawanna/client-portal",
    description: "Private client dashboard for property operations and booking analytics.",
    pushedAt: "2026-04-15T13:00:00Z",
    isPrivate: true,
    repositoryTopics: topics("react", "dashboard", "fullstack"),
  }),
  repo({
    name: "tanstack-db-explorer",
    nameWithOwner: "tigawanna/tanstack-db-explorer",
    description: "Live query playground for TanStack DB collections with optimistic updates.",
    pushedAt: "2026-03-22T17:30:00Z",
    repositoryTopics: topics("tanstack", "react", "state-management"),
  }),
];

const devtoUser = {
  name: "Dennis kinuthia",
  username: "tigawanna",
  profile_image:
    "https://media2.dev.to/dynamic/image/width=640,height=640,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Fuser%2Fprofile_image%2F859413%2Ff6b53ee1-f613-4efe-af59-422c7eeac07a.jpeg",
} satisfies DevtoArticle["user"];

export const STATIC_ARTICLES: DevtoArticle[] = [
  {
    type_of: "article",
    id: 2722997,
    title: "TanStack Start SSR-Friendly Theme Provider",
    description:
      "A complete theme management system for React applications with SSR support and zero flash on first paint.",
    readable_publish_date: "Jul 25 '25",
    slug: "tanstack-start-ssr-friendly-theme-provider-5gee",
    path: "/tigawanna/tanstack-start-ssr-friendly-theme-provider-5gee",
    url: "https://dev.to/tigawanna/tanstack-start-ssr-friendly-theme-provider-5gee",
    comments_count: 1,
    public_reactions_count: 2,
    published_timestamp: "2025-07-25T17:45:17Z",
    positive_reactions_count: 2,
    cover_image:
      "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F47rp6x6jesxoths83n6t.jpg",
    social_image:
      "https://media2.dev.to/dynamic/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F47rp6x6jesxoths83n6t.jpg",
    canonical_url: "https://dev.to/tigawanna/tanstack-start-ssr-friendly-theme-provider-5gee",
    created_at: "2025-07-25T17:45:17Z",
    edited_at: "2025-07-25T17:51:27Z",
    published_at: "2025-07-25T17:45:17Z",
    last_comment_at: "2025-12-06T20:31:42Z",
    reading_time_minutes: 4,
    tag_list: ["tanstackstart", "jamstack", "react", "webdev"],
    tags: "tanstackstart, jamstack, react, webdev",
    user: devtoUser,
  },
  {
    type_of: "article",
    id: 2690574,
    title: "Building Android Widgets in Expo with Custom Native Modules",
    description:
      "A guide to creating Android home screen widgets using Expo modules, complete with state management.",
    readable_publish_date: "Jul 15 '25",
    slug: "building-android-widgets-in-expo-with-custom-native-modules-2mdo",
    path: "/tigawanna/building-android-widgets-in-expo-with-custom-native-modules-2mdo",
    url: "https://dev.to/tigawanna/building-android-widgets-in-expo-with-custom-native-modules-2mdo",
    comments_count: 0,
    public_reactions_count: 0,
    published_timestamp: "2025-07-15T13:17:13Z",
    positive_reactions_count: 0,
    cover_image:
      "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F09iwyqxnzssckbd6x2lt.jpg",
    social_image:
      "https://media2.dev.to/dynamic/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F09iwyqxnzssckbd6x2lt.jpg",
    canonical_url:
      "https://dev.to/tigawanna/building-android-widgets-in-expo-with-custom-native-modules-2mdo",
    created_at: "2025-07-15T13:15:07Z",
    edited_at: "",
    published_at: "2025-07-15T13:17:13Z",
    last_comment_at: "2025-07-15T13:17:13Z",
    reading_time_minutes: 9,
    tag_list: ["expo", "reactnative", "typescript", "jetpackcompose"],
    tags: "expo, reactnative, typescript, jetpackcompose",
    user: devtoUser,
  },
  {
    type_of: "article",
    id: 2690282,
    title: "Setting Up Android Studio on Linux for React Native (Expo) Development",
    description:
      "Installing and configuring Android Studio on Linux for a smooth Expo and React Native workflow.",
    readable_publish_date: "Jul 15 '25",
    slug: "setting-up-android-studio-on-linux-for-react-native-expo-development-57ee",
    path: "/tigawanna/setting-up-android-studio-on-linux-for-react-native-expo-development-57ee",
    url: "https://dev.to/tigawanna/setting-up-android-studio-on-linux-for-react-native-expo-development-57ee",
    comments_count: 0,
    public_reactions_count: 1,
    published_timestamp: "2025-07-15T12:44:43Z",
    positive_reactions_count: 1,
    cover_image:
      "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F1bo99kbz6r9qp08e3c4q.png",
    social_image:
      "https://media2.dev.to/dynamic/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F1bo99kbz6r9qp08e3c4q.png",
    canonical_url:
      "https://dev.to/tigawanna/setting-up-android-studio-on-linux-for-react-native-expo-development-57ee",
    created_at: "2025-07-15T11:51:12Z",
    edited_at: "2025-07-15T13:18:03Z",
    published_at: "2025-07-15T12:44:43Z",
    last_comment_at: "2025-07-15T12:44:43Z",
    reading_time_minutes: 5,
    tag_list: ["reactnative", "androidstudio", "linux", "expo"],
    tags: "reactnative, androidstudio, linux, expo",
    user: devtoUser,
  },
  {
    type_of: "article",
    id: 2528325,
    title: "vite-plugin-graphql-usage",
    description:
      "Automating GraphQL operation discovery in Vite — five hours well spent on a five-minute problem.",
    readable_publish_date: "May 26 '25",
    slug: "vite-plugin-graphql-usage-30de",
    path: "/tigawanna/vite-plugin-graphql-usage-30de",
    url: "https://dev.to/tigawanna/vite-plugin-graphql-usage-30de",
    comments_count: 0,
    public_reactions_count: 1,
    published_timestamp: "2025-05-26T09:36:00Z",
    positive_reactions_count: 1,
    cover_image:
      "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fn7xji27gdn7bnsth84fv.png",
    social_image:
      "https://media2.dev.to/dynamic/image/width=1000,height=500,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fn7xji27gdn7bnsth84fv.png",
    canonical_url: "https://dev.to/tigawanna/vite-plugin-graphql-usage-30de",
    created_at: "2025-05-26T09:36:01Z",
    edited_at: "",
    published_at: "2025-05-26T09:36:00Z",
    last_comment_at: "2025-05-26T09:36:00Z",
    reading_time_minutes: 2,
    tag_list: ["graphql", "vite", "typescript"],
    tags: "graphql, vite, typescript",
    user: devtoUser,
  },
];

export const STATIC_LESSONS: LessonItem[] = [
  {
    id: "til-react-compiler",
    collectionId: "portfolio_milestones",
    collectionName: "portfolio_milestones",
    created: "2026-06-18T10:00:00Z",
    updated: "2026-06-18T10:00:00Z",
    title: "React 19 Compiler makes useMemo optional",
    description:
      "With the React Compiler enabled, manual memoization is usually noise — let the compiler prove stability.",
    type: "til",
    markdown: `## The lesson

React 19's compiler analyzes component render paths and inserts memoization where it can prove it helps.

\`\`\`tsx
function UserList({ users }: { users: User[] }) {
  const sorted = users.toSorted((a, b) => a.name.localeCompare(b.name));
  return sorted.map((user) => <UserRow key={user.id} user={user} />);
}
\`\`\`

No \`useMemo\` wrapper needed — the compiler handles it when dependencies are stable.

[!TIP]
Reach for \`useMemo\` only after profiling shows a real bottleneck.`,
    richtext: "",
  },
  {
    id: "til-eden-treaty",
    collectionId: "portfolio_milestones",
    collectionName: "portfolio_milestones",
    created: "2026-06-10T14:30:00Z",
    updated: "2026-06-10T14:30:00Z",
    title: "Eden Treaty catches API drift at compile time",
    description:
      "Elysia + Eden Treaty means your frontend knows about new endpoints before you ship broken calls.",
    type: "til",
    markdown: `## End-to-end types without codegen

\`\`\`ts
const { data, error } = await treatyClient.users.get();
if (error) throw error;
return data;
\`\`\`

When the Elysia route changes shape, TypeScript fails in the client — not in production.`,
    richtext: "",
    gist: "https://gist.github.com/tigawanna/eden-treaty-example",
  },
  {
    id: "til-router-search",
    collectionId: "portfolio_milestones",
    collectionName: "portfolio_milestones",
    created: "2026-06-02T09:00:00Z",
    updated: "2026-06-02T09:00:00Z",
    title: "Validate TanStack Router search params with Zod",
    description:
      "Coerce and validate URL search state in the route definition — not scattered in components.",
    type: "til",
    markdown: `## Search schema at the route boundary

\`\`\`ts
const searchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
});

export const Route = createFileRoute("/lessons/")({
  validateSearch: (search) => searchSchema.parse(search),
});
\`\`\`

Invalid URLs get normalized before any component renders.`,
    richtext: "",
  },
  {
    id: "til-markdown-ssr",
    collectionId: "portfolio_milestones",
    collectionName: "portfolio_milestones",
    created: "2026-05-20T16:15:00Z",
    updated: "2026-05-20T16:15:00Z",
    title: "Render markdown on the server, ship HTML",
    description:
      "Converting TIL markdown to HTML in a server function keeps bundles small and syntax highlighting consistent.",
    type: "til",
    markdown: `## Server-side conversion

Showdown + highlight.js run once per request. The client receives sanitized HTML previews in cards and full articles on detail pages.

[!NOTE]
Preview cards use \`line-clamp\` on the rendered HTML — no raw markdown over the wire.`,
    richtext: "",
  },
  {
    id: "til-tailwind-v4",
    collectionId: "portfolio_milestones",
    collectionName: "portfolio_milestones",
    created: "2026-05-08T11:45:00Z",
    updated: "2026-05-08T11:45:00Z",
    title: "Tailwind v4 @theme replaces most tailwind.config",
    description:
      "Design tokens live in CSS now — DaisyUI themes plug in through @plugin directives.",
    type: "til",
    markdown: `## CSS-first configuration

\`\`\`css
@import "tailwindcss";
@plugin "daisyui";

@theme {
  --font-serif: "Fraunces", serif;
  --font-sans: "Space Grotesk", sans-serif;
}
\`\`\`

Fewer config files, same utility API.`,
    richtext: "",
  },
  {
    id: "til-better-auth-orgs",
    collectionId: "portfolio_milestones",
    collectionName: "portfolio_milestones",
    created: "2026-04-25T08:30:00Z",
    updated: "2026-04-25T08:30:00Z",
    title: "Better Auth organization plugin patterns",
    description:
      "Invites, roles, and active-org context slot cleanly into TanStack Router beforeLoad guards.",
    type: "til",
    markdown: `## Guard routes with org context

\`\`\`ts
beforeLoad: async ({ context }) => {
  if (!context.context.viewer?.activeOrganization) {
    throw redirect({ to: "/orgs" });
  }
},
\`\`\`

Organization state lives in the session — no parallel auth system needed.`,
    richtext: "",
  },
];

export function getStaticLessonsPage(page: number, perPage: number): LessonsPreviewPage {
  const totalItems = STATIC_LESSONS.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * perPage;
  const slice = STATIC_LESSONS.slice(start, start + perPage);

  return {
    page: safePage,
    perPage,
    totalPages,
    totalItems,
    items: slice.map(toLessonPreviewItem),
  };
}

export function getStaticLessonById(id: string): LessonItem | null {
  return STATIC_LESSONS.find((lesson) => lesson.id === id) ?? null;
}

export function toLessonPreviewItem(item: LessonItem): LessonPreviewItem {
  return {
    id: item.id,
    collectionId: item.collectionId,
    collectionName: item.collectionName,
    created: item.created,
    createdLabel: formatDisplayDate(item.created),
    updated: item.updated,
    title: item.title,
    description: item.description,
    type: item.type,
    gist: item.gist,
    previewHtml: null,
  };
}
