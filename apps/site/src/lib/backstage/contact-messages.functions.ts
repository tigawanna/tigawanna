import { getDb } from "@/lib/drizzle/get-db";
import { contactMessages } from "@/lib/drizzle/schema/app-schema";
import { getAuth } from "@/lib/auth";
import { isAdminUser } from "@/data-access-layer/auth/auth-utils";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { desc } from "drizzle-orm";

async function requireAdminSession() {
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
  if (!session?.user || !isAdminUser(session.user)) {
    throw new Error("Unauthorized");
  }
  return session;
}

export const listContactMessages = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdminSession();
  const db = getDb();
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
});
