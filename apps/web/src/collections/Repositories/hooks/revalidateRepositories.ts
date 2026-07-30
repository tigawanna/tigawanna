import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Busts Next.js cache tags for landing project cards and detail routes.
 */
function bustRepositoryCaches(nameWithOwner?: string) {
  revalidateTag("landing-pinned-repos", "max");
  revalidateTag("landing-recent-repos", "max");
  revalidatePath("/");

  if (nameWithOwner) {
    revalidateTag(`repository_${nameWithOwner}`, "max");
    const [owner, repo] = nameWithOwner.split("/");
    if (owner && repo) {
      revalidateTag(`repository-readme_${owner}/${repo}`, "max");
      revalidatePath(`/project/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
    }
  }
}

/**
 * Revalidates landing project caches after a repository create/update.
 */
export const revalidateRepositories: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const nameWithOwner = typeof doc?.nameWithOwner === "string" ? doc.nameWithOwner : undefined;
    bustRepositoryCaches(nameWithOwner);
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
    const nameWithOwner = typeof doc?.nameWithOwner === "string" ? doc.nameWithOwner : undefined;
    bustRepositoryCaches(nameWithOwner);
  }
  return doc;
};
