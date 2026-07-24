import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  access: {
    admin: authenticated,
    // Open create so the first admin can register; tighten once seeded.
    create: () => true,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
