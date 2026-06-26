import { requireAdminSession } from "@/lib/admin-auth/require-admin";
import { getDb } from "@/lib/drizzle/get-db";
import { contactMessages } from "@/lib/drizzle/schema/app-schema";
import { createServerFn } from "@tanstack/react-start";
import { desc } from "drizzle-orm";

export const listContactMessages = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminSession();
  const db = getDb();
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
});
