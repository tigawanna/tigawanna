import type { Block } from "payload";

export const MediaBlock: Block = {
  slug: "mediaBlock",
  interfaceName: "MediaBlock",
  labels: {
    singular: "Image",
    plural: "Images",
  },
  fields: [
    {
      name: "media",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Preferred — uploaded media wins over Image URL.",
      },
    },
    {
      name: "url",
      type: "text",
      label: "Image URL",
      admin: {
        description: "Remote image (e.g. Dev.to upload) when nothing is uploaded.",
        condition: (_, siblingData) => !siblingData?.media,
      },
      validate: (value: unknown, { siblingData }: { siblingData?: Record<string, unknown> }) => {
        const media = siblingData?.media;
        const url = typeof value === "string" ? value.trim() : "";
        if (media || url) return true;
        return "Add an uploaded image or an image URL.";
      },
    },
    {
      name: "alt",
      type: "text",
      label: "Alt text",
      admin: {
        description: "Used for remote URLs; uploaded media carries its own alt.",
        condition: (_, siblingData) => !siblingData?.media,
      },
    },
  ],
};
