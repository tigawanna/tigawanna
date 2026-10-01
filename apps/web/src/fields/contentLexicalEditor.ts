import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

import { Banner } from "@/blocks/Banner/config";
import { Code } from "@/blocks/Code/config";
import { MediaBlock } from "@/blocks/MediaBlock/config";

/**
 * Shared Lexical editor for blog / README content (headings, code, media, banners, tables).
 *
 * `EXPERIMENTAL_TableFeature` registers the `table` nodes emitted by
 * `markdownToLexicalWithCodeBlocks`; without it the admin can't parse imported tables.
 * Keep `lexical` / `@lexical/*` on a single version or Next bundles two copies.
 */
export function contentLexicalEditor() {
  return lexicalEditor({
    features: ({ rootFeatures }) => [
      ...rootFeatures,
      HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
      BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      HorizontalRuleFeature(),
      EXPERIMENTAL_TableFeature(),
    ],
  });
}
