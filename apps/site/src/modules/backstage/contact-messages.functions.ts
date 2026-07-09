import { requireBackstageSession } from "@/lib/better-auth/session.server";
import { contactMessages, desc } from "@repo/db";
import { getDb } from "@/lib/db/get-db";
import { createServerFn } from "@tanstack/react-start";

export const listContactMessages = createServerFn({ method: "GET" }).handler(async () => {
  await requireBackstageSession();
  const db = getDb();
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
});
