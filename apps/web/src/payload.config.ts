import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Blogs } from "./collections/Blogs";
import { ContactMessages } from "./collections/ContactMessages";
import { Media } from "./collections/Media";
import { Users } from "./collections/Users";
import { getSiteUrl } from "./lib/site-url";
import { telegramEmailAdapter } from "./lib/telegram/email-adapter";

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
    components: {
      views: {
        smartDraft: {
          Component: "/views/AiDraft#AiDraftView",
          path: "/smart-draft",
          meta: {
            title: "Smart draft",
            description: "Generate a blog draft from notes via OpenRouter",
          },
        },
      },
    },
  },
  collections: [Users, Media, Blogs, ContactMessages],
  // Auth / system mail (forgot password, etc.) → Telegram via @repo/telegram.
  email: telegramEmailAdapter,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  // Required so forgot-password emails include an absolute reset URL (not `/admin/reset/...`).
  serverURL: getSiteUrl(),
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  // Drizzle + libSQL: local `file:` SQLite or remote Turso (`libsql://…` + auth token).
  // `push: false` — schema is managed via seed/migrate scripts; auto-push fights
  // renamed journals→blogs indexes and prompts interactively in CI/scripts.
  // WAL is local-file only; Turso/TCP gets a warn + auto-disable if `wal: true`.
  db: sqliteAdapter({
    wal: (process.env.DATABASE_URL || "file:./payload.db").startsWith("file:"),
    push: false,
    client: {
      url: process.env.DATABASE_URL || "file:./payload.db",
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
  }),
  sharp,
});
