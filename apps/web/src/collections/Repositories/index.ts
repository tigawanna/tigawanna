import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";
import { anyone } from "@/access/anyone";
import { syncFromGithubEndpoint } from "./endpoints/sync-from-github";
import {
  revalidateRepositories,
  revalidateRepositoriesDelete,
} from "./hooks/revalidateRepositories";

/**
 * Cached GitHub repository snapshots for the portfolio projects UI.
 * Synced from GitHub via "Pull from GitHub" so the site has a real fallback
 * when the live API is rate-limited or unavailable.
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
    topics: true,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "nameWithOwner", "featured", "pushedAt", "updatedAt"],
    group: "Content",
    description:
      "Open-source project cards. Use “Pull from GitHub” on this list to refresh the cache used when the live API is rate-limited.",
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
  ],
  timestamps: true,
};
