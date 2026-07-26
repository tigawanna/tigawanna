import { editorConfigFactory } from "@payloadcms/richtext-lexical";
import type { SanitizedConfig } from "payload";

import { contentLexicalEditor } from "@/fields/contentLexicalEditor";

/**
 * Sanitized Lexical editor config matching the blogs `content` field
 * (headings, Code/Media/Banner blocks, toolbars).
 */
export async function getContentEditorConfig(config: SanitizedConfig) {
  return editorConfigFactory.fromEditor({
    config,
    editor: contentLexicalEditor(),
  });
}
