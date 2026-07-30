import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Busts Next.js cache tags for landing project cards after repository writes.
 */
function bustRepositoryCaches() {
  revalidateTag("landing-pinned-repos", "max");
  revalidateTag("landing-recent-repos", "max");
  revalidatePath("/");
  revalidatePath("/projects");
}

/**
 * Revalidates landing project caches after a repository create/update.
 */
export const revalidateRepositories: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    bustRepositoryCaches();
  }
  return doc;
};

/**
 * Revalidates landing project caches after a repository delete.
 */
export const revalidateRepositoriesDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    bustRepositoryCaches();
  }
  return doc;
};
