import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Blogs } from "./collections/Blogs";
import { Media } from "./collections/Media";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: " · Tigawanna",
    },
  },
  collections: [Users, Media, Blogs],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  // Drizzle + libSQL: local `file:` SQLite or remote Turso (`libsql://…` + auth token).
  // `push: false` — schema is managed via seed/migrate scripts; auto-push fights
  // renamed journals→blogs indexes and prompts interactively in CI/scripts.
  db: sqliteAdapter({
    wal: true,
    push: false,
    client: {
      url: process.env.DATABASE_URL || "file:./payload.db",
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
  }),
  sharp,
});
