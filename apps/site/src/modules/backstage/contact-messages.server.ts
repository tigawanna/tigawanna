import { getDb } from "@/lib/db/get-db.server";
import {
  buildOrderBy,
  buildPaginatedResponse,
  contactMessages,
  count,
  eq,
  normalizePaginationParams,
  or,
  sql,
  type ContactMessageRow,
  type PaginatedResponse,
} from "@repo/db";

/**
 * Escapes `%`, `_`, and `\` so user search text is treated literally in LIKE.
 */
function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function listContactMessages(data?: {
  page?: number;
  perPage?: number;
  q?: string;
  sortBy?: "createdAt";
  sortOrder?: "asc" | "desc";
}): Promise<PaginatedResponse<ContactMessageRow>> {
  const db = getDb();
  const { page, perPage, offset } = normalizePaginationParams(data ?? {});
  const sortBy = data?.sortBy;
  const sortOrder = data?.sortOrder ?? "desc";
  const q = data?.q?.trim() ?? "";
  const searchPattern = q ? `%${escapeLikePattern(q.toLowerCase())}%` : null;
  const searchWhere = searchPattern
    ? or(
        sql`lower(${contactMessages.name}) like ${searchPattern} escape '\\'`,
        sql`lower(${contactMessages.contact}) like ${searchPattern} escape '\\'`,
        sql`lower(${contactMessages.message}) like ${searchPattern} escape '\\'`,
      )
    : undefined;

  const [{ count: totalItems }] = await db
    .select({ count: count() })
    .from(contactMessages)
    .where(searchWhere);

  const items = await db
    .select()
    .from(contactMessages)
    .where(searchWhere)
    .orderBy(
      buildOrderBy({
        sortBy,
        sortOrder,
        columnMap: { createdAt: contactMessages.createdAt },
        defaultColumn: contactMessages.createdAt,
      }),
    )
    .limit(perPage)
    .offset(offset);

  return buildPaginatedResponse({ items, page, perPage, totalItems });
}

export async function deleteContactMessage(id: string) {
  const db = getDb();
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  return { ok: true as const };
}
