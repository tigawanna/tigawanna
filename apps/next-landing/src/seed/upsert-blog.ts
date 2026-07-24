import type { Payload } from "payload";
import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

type BlogKind = "journal" | "post";

type UpsertBlogInput = {
  title: string;
  kind: BlogKind;
  description: string;
  content: DefaultTypedEditorState;
  slug: string;
  publishedAt?: string;
  gist?: string;
  tags?: Array<{ tag: string }>;
  heroImage?: number;
  coverUrl?: string;
  _status?: "draft" | "published";
  devto?: {
    enabled?: boolean;
    status?: "idle" | "pending" | "published" | "failed";
    url?: string;
    lastSyncedAt?: string;
  };
};

/**
 * Creates or updates a published blog by slug (idempotent).
 */
export async function upsertBlogBySlug(
  payload: Payload,
  data: UpsertBlogInput,
): Promise<"created" | "updated"> {
  const existing = await payload.find({
    collection: "blogs",
    depth: 0,
    limit: 1,
    pagination: false,
    where: { slug: { equals: data.slug } },
  });

  const docData = {
    title: data.title,
    kind: data.kind,
    description: data.description,
    content: data.content,
    slug: data.slug,
    generateSlug: false,
    publishedAt: data.publishedAt,
    gist: data.gist,
    tags: data.tags,
    heroImage: data.heroImage,
    coverUrl: data.coverUrl,
    _status: data._status ?? ("published" as const),
    ...(data.devto ? { devto: data.devto } : {}),
  };

  if (existing.docs[0]) {
    await payload.update({
      collection: "blogs",
      id: existing.docs[0].id,
      data: docData,
      context: { disableRevalidate: true, skipDevtoScaffold: true },
      draft: docData._status === "draft",
      overrideAccess: true,
    });
    return "updated";
  }

  await payload.create({
    collection: "blogs",
    data: docData,
    context: { disableRevalidate: true, skipDevtoScaffold: true },
    draft: docData._status === "draft",
    overrideAccess: true,
  });
  return "created";
}
