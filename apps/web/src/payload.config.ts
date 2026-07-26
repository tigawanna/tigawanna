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
import { telegramEmailAdapter } from "./lib/telegram/email-adapter";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/**
 * Absolute origin for admin auth emails (password reset links, etc.).
 * Prefer an explicit Payload URL so local admin can differ from the public site URL.
 */
function resolveServerURL(): string {
  const fromEnv =
    process.env.PAYLOAD_SERVER_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return "http://localhost:3055";
}

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
  collections: [Users, Media, Blogs, ContactMessages],
  // Auth / system mail (forgot password, etc.) → Telegram via @repo/telegram.
  email: telegramEmailAdapter,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  // Required so forgot-password emails include an absolute reset URL (not `/admin/reset/...`).
  serverURL: resolveServerURL(),
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
