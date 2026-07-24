import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { revalidatePath, revalidateTag } from "next/cache";

import type { Journal } from "@/payload-types";

/**
 * Revalidates journal detail + list caches when a journal is published or unpublished.
 */
export const revalidateJournal: CollectionAfterChangeHook<Journal> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) {
    return doc;
  }

  if (doc._status === "published") {
    const path = `/journals/${doc.slug}`;
    payload.logger.info(`Revalidating journal at path: ${path}`);
    revalidatePath(path);
    revalidatePath("/journals");
    revalidateTag("journals", "max");
    revalidateTag(`journal_${doc.slug}`, "max");
    revalidateTag("landing-journals", "max");
    revalidateTag("landing-posts", "max");
  }

  if (previousDoc?._status === "published" && doc._status !== "published") {
    const oldPath = `/journals/${previousDoc.slug}`;
    payload.logger.info(`Revalidating old journal at path: ${oldPath}`);
    revalidatePath(oldPath);
    revalidatePath("/journals");
    revalidateTag("journals", "max");
    revalidateTag(`journal_${previousDoc.slug}`, "max");
    revalidateTag("landing-journals", "max");
    revalidateTag("landing-posts", "max");
  }

  return doc;
};

/**
 * Revalidates caches when a journal is deleted.
 */
export const revalidateJournalDelete: CollectionAfterDeleteHook<Journal> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    const path = `/journals/${doc?.slug}`;
    revalidatePath(path);
    revalidatePath("/journals");
    revalidateTag("journals", "max");
    if (doc?.slug) revalidateTag(`journal_${doc.slug}`, "max");
    revalidateTag("landing-journals", "max");
    revalidateTag("landing-posts", "max");
  }

  return doc;
};
