import { createDb, DEFAULT_DATABASE_URL } from "@repo/db/client";
import { journalEntries } from "@repo/db";
import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");

config({ path: resolve(rootDir, ".env") });
config({ path: resolve(rootDir, ".env.local"), override: true });

const PB_URL = "https://tigawanna-pocketbase.fly.dev";

interface PocketBaseMilestone {
  id: string;
  title: string;
  description: string;
  markdown: string;
  richtext: string;
  gist: string;
  type: string;
  created: string;
  updated: string;
}

interface PocketBaseListResponse {
  items: PocketBaseMilestone[];
  totalItems: number;
}

function parsePbDate(value: string) {
  return new Date(value.includes("T") ? value : value.replace(" ", "T"));
}

function normalizeType(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "TIL" as const;
  }
  if (trimmed === "CHALLENGE" || trimmed === "TIL" || trimmed === "til" || trimmed === "note") {
    return trimmed as "CHALLENGE" | "TIL" | "til" | "note";
  }
  return "TIL" as const;
}

async function fetchAllMilestones() {
  const endpoint = `${PB_URL}/api/collections/portfolio_milestones/records?perPage=500&sort=-created`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`PocketBase fetch failed: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as PocketBaseListResponse;
  return data.items;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  const db = createDb(databaseUrl, authToken);

  const items = await fetchAllMilestones();
  console.log(`Fetched ${items.length} milestones from PocketBase`);

  let inserted = 0;
  let skipped = 0;

  for (const item of items) {
    const gist = item.gist?.trim() || null;

    const result = await db
      .insert(journalEntries)
      .values({
        id: item.id,
        title: item.title.trim(),
        description: item.description ?? "",
        markdown: item.markdown ?? "",
        richtext: item.richtext ?? "",
        gist,
        type: normalizeType(item.type),
        pinned: false,
        pinOrder: 0,
        createdAt: parsePbDate(item.created),
        updatedAt: parsePbDate(item.updated),
      })
      .onConflictDoNothing()
      .returning({ id: journalEntries.id });

    if (result.length > 0) {
      inserted += 1;
    } else {
      skipped += 1;
    }
  }

  console.log(`Import complete: ${inserted} inserted, ${skipped} skipped (already present)`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
