import { requireAdminSession } from "@/lib/admin-auth/require-admin";
import { contactMessages, desc } from "@repo/db";
import { getDb } from "@/lib/get-db";
import { createServerFn } from "@tanstack/react-start";

export const listContactMessages = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminSession();
  const db = getDb();
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
});
