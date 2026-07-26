import type { Payload, TypedUser } from "payload";

import { getContentEditorConfig } from "@/lib/content-editor-config";
import {
  fetchDevtoArticle,
  normalizeDevtoTags,
  requireDevtoApiKey,
  stripDevtoFrontmatter,
} from "@/lib/devto/client";
import { markdownToLexicalWithCodeBlocks } from "@/lib/markdown-to-lexical";

export type SyncFromDevtoResult = {
  articleId: number;
  url: string;
  title: string;
  coverUrl: string | null;
};

type DevtoOpOptions = {
  user?: TypedUser | null;
};

/**
 * Pulls the linked Dev.to article into Payload (markdown → Lexical + cover URL).
 *
 * Use after finishing images/cover on Dev.to. Does not change Payload publish state
 * except when the site post is already published (then revalidation runs).
 */
export async function syncBlogFromDevto(
  payload: Payload,
  blogId: number | string,
  options: DevtoOpOptions = {},
): Promise<SyncFromDevtoResult> {
  const apiKey = requireDevtoApiKey();
  const access = {
    user: options.user ?? undefined,
    overrideAccess: !options.user,
  };

  const blog = await payload.findByID({
    collection: "blogs",
    id: blogId,
    depth: 0,
    draft: true,
    ...access,
  });

  if (blog.kind !== "post") {
    throw new Error("Only blog posts sync from Dev.to.");
  }

  const articleId = typeof blog.devto?.articleId === "number" ? blog.devto.articleId : null;

  if (articleId == null) {
    throw new Error("Open this post on Dev.to first (no linked article id yet).");
  }

  let article;
  try {
    article = await fetchDevtoArticle(apiKey, articleId);
  } catch (err: unknown) {
    await payload.update({
      collection: "blogs",
      id: blogId,
      data: {
        devto: {
          ...(blog.devto ?? {}),
          status: "failed",
        },
      },
      draft: true,
      context: { disableRevalidate: true },
      ...access,
    });
    throw err;
  }

  const editorConfig = await getContentEditorConfig(payload.config);
  const markdown = article.body_markdown?.trim()
    ? stripDevtoFrontmatter(article.body_markdown)
    : article.description || blog.description;

  const content = markdownToLexicalWithCodeBlocks(markdown, editorConfig);
  const tags = normalizeDevtoTags(article.tag_list).map((tag) => ({ tag }));
  const coverUrl = article.cover_image || blog.coverUrl || null;
  const syncedAt = new Date().toISOString();

  await payload.update({
    collection: "blogs",
    id: blogId,
    data: {
      title: article.title || blog.title,
      description: article.description || blog.description,
      content,
      ...(tags.length > 0 ? { tags } : {}),
      ...(coverUrl ? { coverUrl } : {}),
      devto: {
        enabled: true,
        status: article.published ? "published" : "pending",
        articleId: article.id,
        url: article.url,
        lastSyncedAt: syncedAt,
      },
    },
    // Keep Payload draft/publish state — sync only refreshes content + Dev.to meta.
    draft: blog._status !== "published",
    context: { disableRevalidate: blog._status !== "published" },
    ...access,
  });

  return {
    articleId: article.id,
    url: article.url,
    title: article.title,
    coverUrl,
  };
}
