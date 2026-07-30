import type { CollectionConfig } from "payload";
import { slugField } from "payload";

import { authenticated } from "@/access/authenticated";
import { authenticatedOrPublished } from "@/access/authenticatedOrPublished";
import { contentLexicalEditor } from "@/fields/contentLexicalEditor";
import {
  aiDraftEndpoint,
  aiDraftModelsEndpoint,
  aiDraftStatusEndpoint,
  aiRefineEndpoint,
} from "./endpoints/ai-draft";
import { openDevtoEndpoint, syncDevtoEndpoint, importFromDevtoEndpoint } from "./endpoints/devto";
import { fromMarkdownEndpoint } from "./endpoints/from-markdown";
import { toMarkdownEndpoint } from "./endpoints/to-markdown";
import { revalidateBlog, revalidateBlogDelete } from "./hooks/revalidateBlog";

export const Blogs: CollectionConfig = {
  slug: "blogs",
  labels: {
    singular: "Blog",
    plural: "Blogs",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    description: true,
    kind: true,
    publishedAt: true,
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "kind", "slug", "_status", "updatedAt"],
    group: "Content",
    description:
      "All writing lives here. Mark an entry as Journal or Blog post — you can switch later if a short note grows into a full post.",
    components: {
      beforeList: ["/collections/Blogs/components/BlogsListActions#BlogsListActions"],
      edit: {
        editMenuItems: ["/collections/Blogs/components/BlogEditMenuItems#BlogEditMenuItems"],
      },
    },
  },
  endpoints: [
    aiDraftStatusEndpoint,
    aiDraftModelsEndpoint,
    aiDraftEndpoint,
    aiRefineEndpoint,
    toMarkdownEndpoint,
    fromMarkdownEndpoint,
    importFromDevtoEndpoint,
    openDevtoEndpoint,
    syncDevtoEndpoint,
  ],
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "journal",
      options: [
        {
          label: "Journal",
          value: "journal",
        },
        {
          label: "Blog post",
          value: "post",
        },
      ],
      admin: {
        position: "sidebar",
        description:
          "Journals are short TILs/snippets. Blog posts are longer pieces. Switch anytime.",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            {
              name: "description",
              type: "textarea",
              required: true,
              admin: {
                description: "Short summary shown on cards and SEO previews.",
              },
            },
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
              admin: {
                condition: (_, siblingData) => siblingData?.kind === "post",
                description: "Preferred cover — uploaded media wins over Cover URL.",
              },
            },
            {
              name: "coverUrl",
              type: "text",
              admin: {
                condition: (_, siblingData) => siblingData?.kind === "post",
                description:
                  "Optional remote cover (e.g. Dev.to social image) when no uploaded hero is set.",
              },
            },
            {
              name: "content",
              type: "richText",
              required: true,
              editor: contentLexicalEditor(),
            },
          ],
        },
        {
          label: "Meta",
          fields: [
            {
              name: "gist",
              type: "text",
              admin: {
                description: "Optional GitHub Gist URL (handy for journal snippets).",
                condition: (_, siblingData) => siblingData?.kind === "journal",
              },
            },
            {
              name: "tags",
              type: "array",
              labels: { singular: "Tag", plural: "Tags" },
              fields: [
                {
                  name: "tag",
                  type: "text",
                  required: true,
                },
              ],
            },
            {
              name: "devto",
              type: "group",
              label: "Dev.to",
              admin: {
                description:
                  "Write here as a draft → Publish to Dev.to (seed text + canonical URL) → add images there → Sync back. Also in the document ⋯ menu. Publish on this site when ready.",
                condition: (_, siblingData) => siblingData?.kind === "post",
              },
              fields: [
                {
                  name: "actions",
                  type: "ui",
                  admin: {
                    components: {
                      Field: "/collections/Blogs/components/DevtoActions#DevtoActions",
                    },
                  },
                },
                {
                  name: "enabled",
                  type: "checkbox",
                  defaultValue: false,
                  label: "Linked to Dev.to",
                  admin: {
                    readOnly: true,
                    description: "Set automatically when you Open or Sync.",
                  },
                },
                {
                  name: "status",
                  type: "select",
                  defaultValue: "idle",
                  options: [
                    { label: "Idle", value: "idle" },
                    { label: "Pending", value: "pending" },
                    { label: "Published", value: "published" },
                    { label: "Failed", value: "failed" },
                  ],
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: "articleId",
                  type: "number",
                  label: "Dev.to article ID",
                  admin: {
                    description: "Numeric Forem id — used for Sync / Update.",
                    readOnly: true,
                  },
                },
                {
                  name: "url",
                  type: "text",
                  label: "Dev.to article URL",
                  admin: {
                    description:
                      "Filled after Open (or paste manually if linking an existing post).",
                  },
                },
                {
                  name: "lastSyncedAt",
                  type: "date",
                  admin: {
                    readOnly: true,
                    date: { pickerAppearance: "dayAndTime" },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === "published" && !value) {
              return new Date();
            }
            return value;
          },
        ],
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateBlog],
    afterDelete: [revalidateBlogDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 400,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  timestamps: true,
};
