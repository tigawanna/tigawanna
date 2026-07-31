import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";
import { anyone } from "@/access/anyone";
import { syncFromGithubEndpoint } from "./endpoints/sync-from-github";
import {
  revalidateRepositories,
  revalidateRepositoriesDelete,
} from "./hooks/revalidateRepositories";

/**
 * Cached GitHub repository snapshots (backup when the live landing fetch fails).
 * Synced from GitHub via admin “Pull from GitHub” or the daily Vercel cron —
 * metadata only. README / monorepo enrichment is manual cherry-pick.
 */
export const Repositories: CollectionConfig = {
  slug: "repositories",
  labels: {
    singular: "Repository",
    plural: "Repositories",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  defaultPopulate: {
    name: true,
    nameWithOwner: true,
    description: true,
    openGraphImageUrl: true,
    homepageUrl: true,
    url: true,
    pushedAt: true,
    featured: true,
    category: true,
    topics: true,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "nameWithOwner", "category", "featured", "pushedAt", "updatedAt"],
    pagination: {
      defaultLimit: 30,
    },
    group: "Content",
    description:
      "Backup snapshots for project cards. Refresh via “Pull from GitHub” or the daily cron (metadata only; skips repos not pushed in 2 days).",
    components: {
      beforeList: [
        "/collections/Repositories/components/SyncFromGithubListAction#SyncFromGithubListAction",
      ],
    },
  },
  endpoints: [syncFromGithubEndpoint],
  hooks: {
    afterChange: [revalidateRepositories],
    afterDelete: [revalidateRepositoriesDelete],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "Repository name (card title).",
      },
    },
    {
      name: "nameWithOwner",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "owner/repo — unique key for upserts and detail routes.",
      },
    },
    {
      name: "url",
      type: "text",
      required: true,
      admin: {
        description: "GitHub repository URL (Source link).",
      },
    },
    {
      name: "homepageUrl",
      type: "text",
      admin: {
        description: "Optional project site URL.",
      },
    },
    {
      name: "openGraphImageUrl",
      type: "text",
      admin: {
        description: "Cover image URL (GitHub open-graph image).",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "Short card description.",
      },
    },
    {
      name: "descriptionHTML",
      type: "textarea",
      admin: {
        description: "HTML description from GitHub (optional).",
        rows: 3,
      },
    },
    {
      name: "topics",
      type: "array",
      labels: {
        singular: "Topic",
        plural: "Topics",
      },
      admin: {
        description: "Repository topics / tech tags shown on cards.",
      },
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "category",
      type: "select",
      options: [
        { label: "Frontend", value: "frontend" },
        { label: "Backend", value: "backend" },
        { label: "Mobile", value: "mobile" },
        { label: "DevTools", value: "devtools" },
        { label: "Data", value: "data" },
        { label: "Full-stack", value: "fullstack" },
        { label: "Other", value: "other" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Curated filter bucket. Inferred from GitHub topics on first sync; manual edits are kept on later pulls.",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      required: true,
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Shown under the Featured filter (GitHub pinned repos).",
      },
    },
    {
      name: "pushedAt",
      type: "date",
      required: true,
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayAndTime",
        },
        description: "Last push time from GitHub.",
      },
    },
    {
      name: "isPrivate",
      type: "checkbox",
      required: true,
      defaultValue: false,
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "isFork",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "isArchived",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "stargazerCount",
      type: "number",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "forkCount",
      type: "number",
      admin: {
        position: "sidebar",
        readOnly: true,
      },
    },
    {
      name: "lastSyncedAt",
      type: "date",
      admin: {
        position: "sidebar",
        readOnly: true,
        date: {
          pickerAppearance: "dayAndTime",
        },
        description: "When this row was last updated from GitHub.",
      },
    },
    {
      name: "lastEnrichedAt",
      type: "date",
      admin: {
        position: "sidebar",
        readOnly: true,
        date: {
          pickerAppearance: "dayAndTime",
        },
        description:
          "When README / monorepo enrichment last succeeded. Sync skips spelunk when GitHub pushedAt is not newer.",
      },
    },
    {
      name: "defaultBranch",
      type: "text",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Default branch used when resolving README asset URLs.",
      },
    },
    {
      name: "isMonorepo",
      type: "checkbox",
      required: true,
      defaultValue: false,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Detected turbo / pnpm / workspace package.json layout.",
      },
    },
    {
      name: "monorepoKind",
      type: "select",
      options: [
        { label: "Turborepo", value: "turbo" },
        { label: "pnpm", value: "pnpm" },
        { label: "npm workspaces", value: "npm" },
        { label: "Yarn workspaces", value: "yarn" },
        { label: "Lerna", value: "lerna" },
        { label: "Nx", value: "nx" },
        { label: "Nested packages", value: "nested" },
      ],
      admin: {
        position: "sidebar",
        readOnly: true,
        condition: (_, siblingData) => Boolean(siblingData?.isMonorepo),
      },
    },
    {
      name: "readmeMarkdown",
      type: "textarea",
      admin: {
        description: "Root README.md captured on sync (no live GitHub fetch on the site).",
        rows: 8,
      },
    },
    {
      name: "packages",
      type: "array",
      labels: {
        singular: "Package",
        plural: "Packages",
      },
      admin: {
        description:
          "Root + workspace apps/packages discovered on sync (nested READMEs when present).",
      },
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
        },
        {
          name: "path",
          type: "text",
          required: true,
          admin: {
            description: 'Directory relative to repo root ("." for root).',
          },
        },
        {
          name: "kind",
          type: "select",
          required: true,
          defaultValue: "other",
          options: [
            { label: "Root", value: "root" },
            { label: "App", value: "app" },
            { label: "Package", value: "package" },
            { label: "Other", value: "other" },
          ],
        },
        {
          name: "description",
          type: "text",
        },
        {
          name: "readmePath",
          type: "text",
          admin: {
            readOnly: true,
          },
        },
        {
          name: "readmeMarkdown",
          type: "textarea",
          admin: {
            rows: 6,
            description: "Empty when the package has no README — UI shows the name only.",
          },
        },
      ],
    },
  ],
  timestamps: true,
};
