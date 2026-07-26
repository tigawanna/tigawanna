import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";
import type { Payload, TypedUser } from "payload";

import { getContentEditorConfig } from "@/lib/content-editor-config";
import {
  createDevtoArticle,
  getDevtoEditUrl,
  requireDevtoApiKey,
  updateDevtoArticle,
} from "@/lib/devto/client";
import { lexicalToMarkdownWithBlocks } from "@/lib/lexical-to-markdown";
import { getBlogCanonicalUrl } from "@/lib/site-url";
import type { Blog } from "@/payload-types";

export type OpenOnDevtoResult = {
  articleId: number;
  url: string;
  editUrl: string;
  created: boolean;
};

type DevtoOpOptions = {
  user?: TypedUser | null;
};

/**
 * Resolves a remote cover URL from `coverUrl` or populated `heroImage`.
 */
function resolveCoverForDevto(blog: Blog): string | undefined {
  if (blog.coverUrl?.trim()) return blog.coverUrl.trim();
  const hero = blog.heroImage;
  if (hero && typeof hero === "object" && typeof hero.url === "string" && hero.url) {
    if (hero.url.startsWith("http://") || hero.url.startsWith("https://")) {
      return hero.url;
    }
  }
  return undefined;
}

/**
 * Pushes a Payload blog post to Dev.to as a draft (or updates an existing link).
 *
 * Sets `canonical_url` to this site's `/blogs/{slug}` so SEO stays on-site.
 * Stores `devto.articleId` / `url` / `status` on the blog document.
 */
export async function openBlogOnDevto(
  payload: Payload,
  blogId: number | string,
  options: DevtoOpOptions = {},
): Promise<OpenOnDevtoResult> {
  const apiKey = requireDevtoApiKey();
  const access = {
    user: options.user ?? undefined,
    overrideAccess: !options.user,
  };

  const blog = await payload.findByID({
    collection: "blogs",
    id: blogId,
    depth: 1,
    draft: true,
    ...access,
  });

  if (blog.kind !== "post") {
    throw new Error("Only blog posts can be opened on Dev.to (journals stay local).");
  }

  if (!blog.slug) {
    throw new Error("Save the post with a slug before opening on Dev.to.");
  }

  if (!blog.content) {
    throw new Error("Post content is empty.");
  }

  const editorConfig = await getContentEditorConfig(payload.config);
  const bodyMarkdown = lexicalToMarkdownWithBlocks(
    blog.content as DefaultTypedEditorState,
    editorConfig,
  );

  if (!bodyMarkdown.trim()) {
    throw new Error("Converted markdown is empty — add some content first.");
  }

  const tags = (blog.tags ?? [])
    .map((row) => row?.tag?.trim())
    .filter((tag): tag is string => Boolean(tag));

  const writeInput = {
    title: blog.title,
    bodyMarkdown,
    description: blog.description,
    tags,
    canonicalUrl: getBlogCanonicalUrl(blog.slug),
    published: false as boolean,
    mainImage: resolveCoverForDevto(blog),
  };

  const existingId = typeof blog.devto?.articleId === "number" ? blog.devto.articleId : null;

  let article;
  let created = false;

  try {
    if (existingId != null) {
      // Keep Dev.to publish state — only refresh body + canonical metadata.
      article = await updateDevtoArticle(apiKey, existingId, {
        title: writeInput.title,
        bodyMarkdown: writeInput.bodyMarkdown,
        description: writeInput.description,
        tags: writeInput.tags,
        canonicalUrl: writeInput.canonicalUrl,
        mainImage: writeInput.mainImage,
      });
    } else {
      article = await createDevtoArticle(apiKey, writeInput);
      created = true;
    }
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

  const editUrl = getDevtoEditUrl(article.url);

  await payload.update({
    collection: "blogs",
    id: blogId,
    data: {
      devto: {
        enabled: true,
        status: "pending",
        articleId: article.id,
        url: article.url,
        lastSyncedAt: blog.devto?.lastSyncedAt ?? undefined,
      },
    },
    draft: true,
    context: { disableRevalidate: true },
    ...access,
  });

  return {
    articleId: article.id,
    url: article.url,
    editUrl,
    created,
  };
}
