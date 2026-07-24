import type { CollectionConfig } from "payload";
import { slugField } from "payload";
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

import { authenticated } from "@/access/authenticated";
import { authenticatedOrPublished } from "@/access/authenticatedOrPublished";
import { Banner } from "@/blocks/Banner/config";
import { Code } from "@/blocks/Code/config";
import { MediaBlock } from "@/blocks/MediaBlock/config";
import { revalidateJournal, revalidateJournalDelete } from "./hooks/revalidateJournal";
import { scaffoldDevtoCrossPost } from "./hooks/scaffoldDevtoCrossPost";

export const Journals: CollectionConfig = {
  slug: "journals",
  labels: {
    singular: "Journal",
    plural: "Journals",
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
    kind: true,
    description: true,
    publishedAt: true,
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "kind", "slug", "_status", "updatedAt"],
  },
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
      defaultValue: "til",
      options: [
        { label: "Blog post", value: "post" },
        { label: "TIL / snippet", value: "til" },
      ],
      admin: {
        position: "sidebar",
        description: "Posts are longer essays; TILs are short notes and snippets.",
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
                condition: (data) => data?.kind === "post",
              },
            },
            {
              name: "content",
              type: "richText",
              required: true,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
                  BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                  HorizontalRuleFeature(),
                ],
              }),
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
                description: "Optional GitHub Gist URL for TIL snippets.",
                condition: (data) => data?.kind === "til",
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
              label: "Dev.to cross-post",
              admin: {
                description:
                  "Scaffold only — publish workflow lands later. Canonical URL on Dev.to should point back here.",
                condition: (data) => data?.kind === "post",
              },
              fields: [
                {
                  name: "enabled",
                  type: "checkbox",
                  defaultValue: false,
                  label: "Cross-post to Dev.to when published",
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
                  name: "url",
                  type: "text",
                  label: "Dev.to article URL",
                  admin: {
                    description: "Filled after a successful cross-post (or pasted manually).",
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
    afterChange: [revalidateJournal, scaffoldDevtoCrossPost],
    afterDelete: [revalidateJournalDelete],
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
