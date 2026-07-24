import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { revalidatePath, revalidateTag } from "next/cache";

import type { Blog } from "@/payload-types";

type BlogKind = NonNullable<Blog["kind"]>;

/**
 * Public path prefix for a blog kind.
 */
function pathForKind(kind: BlogKind): "/blogs" | "/journals" {
  return kind === "journal" ? "/journals" : "/blogs";
}

/**
 * Revalidates list + detail caches for a given kind/slug.
 */
function revalidateBlogPaths(kind: BlogKind, slug: string) {
  const base = pathForKind(kind);
  revalidatePath(`${base}/${slug}`);
  revalidatePath(base);
  revalidateTag("blogs", "max");
  revalidateTag(`blog_${slug}`, "max");
  if (kind === "journal") {
    revalidateTag("landing-journals", "max");
    revalidateTag("journals", "max");
  } else {
    revalidateTag("landing-posts", "max");
  }
}

/**
 * Revalidates when a blog is published, unpublished, or kind-switched.
 */
export const revalidateBlog: CollectionAfterChangeHook<Blog> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) {
    return doc;
  }

  const kind = doc.kind ?? "journal";

  if (doc._status === "published") {
    payload.logger.info(`Revalidating blog (${kind}) at ${pathForKind(kind)}/${doc.slug}`);
    revalidateBlogPaths(kind, doc.slug);
  }

  if (previousDoc?._status === "published" && doc._status !== "published") {
    const prevKind = previousDoc.kind ?? "journal";
    payload.logger.info(
      `Revalidating unpublished blog ${pathForKind(prevKind)}/${previousDoc.slug}`,
    );
    revalidateBlogPaths(prevKind, previousDoc.slug);
  }

  // Kind switched while published — clear the old public URL too.
  if (
    previousDoc?._status === "published" &&
    doc._status === "published" &&
    previousDoc.kind &&
    previousDoc.kind !== kind
  ) {
    revalidateBlogPaths(previousDoc.kind, previousDoc.slug);
  }

  return doc;
};

/**
 * Revalidates caches when a blog is deleted.
 */
export const revalidateBlogDelete: CollectionAfterDeleteHook<Blog> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate && doc?.slug) {
    revalidateBlogPaths(doc.kind ?? "journal", doc.slug);
  }
  return doc;
};
