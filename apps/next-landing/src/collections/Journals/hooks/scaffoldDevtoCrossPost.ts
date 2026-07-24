import type { CollectionAfterChangeHook } from "payload";

import type { Journal } from "@/payload-types";

/**
 * Scaffold for future Dev.to cross-posting.
 *
 * When a published blog post has `devto.enabled`, log intent so a real
 * workflow (API publish + store returned URL) can plug in later.
 * Canonical URL on Dev.to should point back to `/journals/{slug}`.
 */
export const scaffoldDevtoCrossPost: CollectionAfterChangeHook<Journal> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.skipDevtoScaffold) {
    return doc;
  }

  const justPublished =
    doc._status === "published" && previousDoc?._status !== "published";
  const wantsCrossPost = doc.kind === "post" && doc.devto?.enabled;

  if (!justPublished || !wantsCrossPost) {
    return doc;
  }

  if (doc.devto?.url) {
    payload.logger.info(
      `Dev.to already linked for journal "${doc.slug}": ${doc.devto.url}`,
    );
    return doc;
  }

  payload.logger.info(
    [
      `[devto-scaffold] Journal "${doc.slug}" is ready for Dev.to cross-post.`,
      `Canonical URL should be /journals/${doc.slug}.`,
      "Wire DEVTO_API_KEY + a jobs task to publish and set devto.url / status.",
    ].join(" "),
  );

  return doc;
};
