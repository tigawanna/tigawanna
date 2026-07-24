import type { DefaultTypedEditorState, SerializedBlockNode } from "@payloadcms/richtext-lexical";
import {
  RichText as ConvertRichText,
  LinkJSXConverter,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedLinkNode } from "@payloadcms/richtext-lexical";

import { BannerBlock } from "@/blocks/Banner/Component";
import { CodeBlock, type CodeBlockProps } from "@/blocks/Code/Component";
import { MediaBlock } from "@/blocks/MediaBlock/Component";
import { cn } from "@/lib/cn";
import type {
  BannerBlock as BannerBlockProps,
  MediaBlock as MediaBlockProps,
} from "@/payload-types";

type NodeTypes =
  | SerializedBlockNode<BannerBlockProps>
  | SerializedBlockNode<CodeBlockProps>
  | SerializedBlockNode<MediaBlockProps>;

/**
 * Builds an internal href for Lexical document links.
 */
function internalDocToHref({ linkNode }: { linkNode: SerializedLinkNode }): string {
  const { value, relationTo } = linkNode.fields.doc!;
  if (typeof value !== "object" || value === null) {
    throw new Error("Expected internal link value to be a document object");
  }
  const slug = "slug" in value && typeof value.slug === "string" ? value.slug : "";
  if (relationTo === "blogs") {
    const kind =
      "kind" in value && (value.kind === "journal" || value.kind === "post") ? value.kind : "post";
    return kind === "journal" ? `/journals/${slug}` : `/blogs/${slug}`;
  }
  return `/${slug}`;
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    banner: ({ node }) => <BannerBlock {...node.fields} />,
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    mediaBlock: ({ node }) => <MediaBlock className="col-start-1 col-span-3" {...node.fields} />,
  },
});

type Props = {
  data: DefaultTypedEditorState;
  enableGutter?: boolean;
  enableProse?: boolean;
  className?: string;
};

/**
 * Renders Payload Lexical rich text with Code / Banner / Media blocks.
 */
export function RichText({ className, data, enableGutter = true, enableProse = true }: Props) {
  return (
    <ConvertRichText
      converters={jsxConverters}
      data={data}
      className={cn(
        "payload-richtext",
        {
          container: enableGutter,
          "max-w-none": !enableGutter,
          "prose prose-invert mx-auto md:prose-lg": enableProse,
        },
        className,
      )}
    />
  );
}
