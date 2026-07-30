import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";
import { getPayload } from "payload";
import config from "@payload-config";

import { getContentEditorConfig } from "@/lib/content-editor-config";
import { markdownToLexicalWithCodeBlocks } from "@/lib/markdown-to-lexical";

/**
 * Rewrites relative README image paths to absolute raw.githubusercontent.com URLs.
 *
 * @param markdown - README markdown body.
 * @param owner - GitHub owner.
 * @param repo - Repository name.
 * @param branch - Branch the README was fetched from.
 * @param readmeDir - Directory containing the README (`"."` for root).
 */
export function absolutizeReadmeAssetUrls(
  markdown: string,
  owner: string,
  repo: string,
  branch: string,
  readmeDir = ".",
): string {
  const dirPrefix =
    readmeDir === "." || !readmeDir.trim() ? "" : `${readmeDir.replace(/\/$/, "")}/`;
  const base = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${dirPrefix}`;

  return markdown.replace(
    /(!\[[^\]]*\]\()(?!https?:\/\/|data:|\/\/)([^)\s]+)/g,
    (_match, prefix: string, assetPath: string) => {
      const cleaned = assetPath.replace(/^\.\//, "").replace(/^\//, "");
      return `${prefix}${base}${cleaned}`;
    },
  );
}

/**
 * Converts stored README markdown into Lexical (same path as blog imports).
 *
 * @param markdown - Raw markdown from Payload.
 * @param owner - GitHub owner (for relative image URLs).
 * @param repo - Repository name.
 * @param branch - Default branch.
 * @param readmeDir - Directory of the README file.
 */
export async function markdownToReadmeLexical(
  markdown: string,
  owner: string,
  repo: string,
  branch: string,
  readmeDir = ".",
): Promise<DefaultTypedEditorState | null> {
  const trimmed = markdown.trim();
  if (!trimmed) return null;

  const prepared = absolutizeReadmeAssetUrls(trimmed, owner, repo, branch, readmeDir);
  const payload = await getPayload({ config });
  const editorConfig = await getContentEditorConfig(payload.config);
  return markdownToLexicalWithCodeBlocks(prepared, editorConfig);
}
