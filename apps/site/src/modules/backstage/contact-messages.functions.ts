import { createBackstageServerFn } from "@/lib/tanstack/create-backstage-server-fn";
import { getDb } from "@/lib/db/get-db";
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
import { z } from "zod";

const listContactMessagesInputSchema = z
  .object({
    page: z.number().int().positive().optional(),
    perPage: z.number().int().positive().max(500).optional(),
    q: z.string().optional(),
    sortBy: z.enum(["createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  })
  .optional();

/**
 * Escapes `%`, `_`, and `\` so user search text is treated literally in LIKE.
 *
 * @param value - Raw search fragment from the client.
 */
function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

/**
 * Lists contact form submissions for backstage, paginated.
 *
 * Requires an authenticated admin session. Optional `q` filters name, contact,
 * and message with a case-insensitive LIKE.
 */
export const listContactMessages = createBackstageServerFn({ method: "GET" })
  .validator((input?: z.infer<typeof listContactMessagesInputSchema>) =>
    listContactMessagesInputSchema.parse(input),
  )
  .handler(async ({ data }): Promise<PaginatedResponse<ContactMessageRow>> => {
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
  });

const contactMessageIdSchema = z.object({
  id: z.string().min(1),
});

/**
 * Permanently deletes a contact message by id.
 *
 * Requires an authenticated admin session.
 */
export const deleteContactMessage = createBackstageServerFn({ method: "POST" })
  .validator((input: z.infer<typeof contactMessageIdSchema>) => contactMessageIdSchema.parse(input))
  .handler(async ({ data }) => {
    const db = getDb();
    await db.delete(contactMessages).where(eq(contactMessages.id, data.id));
    return { ok: true as const };
  });
