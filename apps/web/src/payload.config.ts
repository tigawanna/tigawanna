import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Blogs } from "./collections/Blogs";
import { ContactMessages } from "./collections/ContactMessages";
import { Media } from "./collections/Media";
import { Repositories } from "./collections/Repositories";
import { Users } from "./collections/Users";
import { jobsConfig } from "./jobs";
import { getSiteUrl } from "./lib/site-url";
import { telegramEmailAdapter } from "./lib/telegram/email-adapter";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const siteUrl = getSiteUrl();

/**
 * Origins allowed to present the Payload auth cookie on credentialed fetch.
 *
 * Payload always adds `serverURL` to this list. We also allow local admin and
 * both apex / www, otherwise POSTs from `localhost` (or non-www) look logged-in
 * in the UI but custom endpoints see `req.user === undefined` → 401.
 */
function csrfOrigins(): string[] {
  const origins = new Set<string>(["http://localhost:3055", "http://127.0.0.1:3055", siteUrl]);

  try {
    const url = new URL(siteUrl);
    if (url.hostname.startsWith("www.")) {
      origins.add(`${url.protocol}//${url.hostname.slice(4)}`);
    } else if (url.hostname.includes(".")) {
      origins.add(`${url.protocol}//www.${url.hostname}`);
    }
  } catch {
    // ignore invalid site URL — sanitize still pushes serverURL
  }

  return [...origins];
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
  collections: [Users, Media, Blogs, ContactMessages, Repositories],
  // GitHub sync jobs — run via `/api/payload-jobs/run` (no autoRun on Vercel).
  jobs: jobsConfig,
  // Auth / system mail (forgot password, etc.) → Telegram via @repo/telegram.
  email: telegramEmailAdapter,
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  // Required so forgot-password emails include an absolute reset URL (not `/admin/reset/...`).
  serverURL: siteUrl,
  csrf: csrfOrigins(),
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
