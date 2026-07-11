import { requireBackstageSession } from "@/lib/better-auth/session.server";
import { getDb } from "@/lib/db/get-db";
import {
  buildOrderBy,
  buildPaginatedResponse,
  contactMessages,
  count,
  normalizePaginationParams,
  type ContactMessageRow,
  type PaginatedResponse,
} from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const listContactMessagesInputSchema = z
  .object({
    page: z.number().int().positive().optional(),
    perPage: z.number().int().positive().max(500).optional(),
    sortBy: z.enum(["createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  })
  .optional();

/**
 * Lists contact form submissions for backstage, paginated.
 *
 * Requires an authenticated admin session. Rows are returned as-is from Drizzle.
 */
export const listContactMessages = createServerFn({ method: "GET" })
  .validator((input?: z.infer<typeof listContactMessagesInputSchema>) =>
    listContactMessagesInputSchema.parse(input),
  )
  .handler(async ({ data }): Promise<PaginatedResponse<ContactMessageRow>> => {
    await requireBackstageSession();
    const db = getDb();
    const { page, perPage, offset } = normalizePaginationParams(data ?? {});
    const sortBy = data?.sortBy;
    const sortOrder = data?.sortOrder ?? "desc";

    const [{ count: totalItems }] = await db.select({ count: count() }).from(contactMessages);

    const items = await db
      .select()
      .from(contactMessages)
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
