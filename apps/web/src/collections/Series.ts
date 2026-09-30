import type { CollectionAfterChangeHook, CollectionConfig } from "payload";
import { slugField } from "payload";
import { revalidateTag } from "next/cache";

import { anyone } from "@/access/anyone";
import { authenticated } from "@/access/authenticated";
import type { Series as SeriesDoc } from "@/payload-types";

/**
 * Series title / membership shows on every part's page — bust blog caches on change.
 */
const revalidateSeries: CollectionAfterChangeHook<SeriesDoc> = ({ doc, req: { context } }) => {
  if (context.disableRevalidate) return doc;
  revalidateTag("blogs", "max");
  revalidateTag("series", "max");
  return doc;
};

export const Series: CollectionConfig = {
  slug: "series",
  labels: {
    singular: "Series",
    plural: "Series",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    group: "Content",
    description:
      "Multi-part blog posts. Dev.to import creates these automatically; parts are ordered by publish date. Title is sent to Dev.to as the series name.",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Also the Dev.to series name — keep them in sync when renaming.",
      },
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "posts",
      type: "join",
      collection: "blogs",
      on: "series",
      defaultSort: "publishedAt",
      admin: {
        defaultColumns: ["title", "publishedAt", "_status"],
      },
    },
    {
      name: "devtoCollectionId",
      type: "number",
      unique: true,
      label: "Dev.to series ID",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Set by Dev.to import (`collection_id`).",
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateSeries],
  },
  timestamps: true,
};
