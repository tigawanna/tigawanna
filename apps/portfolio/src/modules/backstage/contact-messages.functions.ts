import { requireBackstageSession } from "@/lib/better-auth/session.server";
import {
  deleteContactMessage as deleteContactMessageImpl,
  listContactMessages as listContactMessagesImpl,
} from "@/modules/backstage/contact-messages.server";
import type { ContactMessageRow, PaginatedResponse } from "@repo/db";
import { createServerFn } from "@tanstack/react-start";
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

export const listContactMessages = createServerFn({ method: "GET" })
  .validator((input?: z.infer<typeof listContactMessagesInputSchema>) =>
    listContactMessagesInputSchema.parse(input),
  )
  .handler(async ({ data }): Promise<PaginatedResponse<ContactMessageRow>> => {
    await requireBackstageSession();
    return listContactMessagesImpl(data);
  });

const contactMessageIdSchema = z.object({
  id: z.string().min(1),
});

export const deleteContactMessage = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof contactMessageIdSchema>) => contactMessageIdSchema.parse(input))
  .handler(async ({ data }) => {
    await requireBackstageSession();
    return deleteContactMessageImpl(data.id);
  });
