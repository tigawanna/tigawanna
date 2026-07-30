import {
  BlocksFeature,
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
 * Shared Lexical editor for blog / README content (headings, code, media, banners).
 *
 * GFM pipe tables are lifted in `markdownToLexicalWithCodeBlocks` — do not enable
 * `EXPERIMENTAL_TableFeature` here; it pulls a second `lexical` copy under Next and
 * breaks `convertMarkdownToLexical` with ListNode subclass errors.
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
    ],
  });
}
