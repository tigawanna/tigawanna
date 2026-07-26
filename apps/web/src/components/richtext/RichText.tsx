import type { DefaultTypedEditorState, SerializedBlockNode } from "@payloadcms/richtext-lexical";
import {
  RichText as ConvertRichText,
  LinkJSXConverter,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type {
  SerializedHeadingNode,
  SerializedLinkNode,
  SerializedQuoteNode,
} from "@payloadcms/richtext-lexical";
import { connection } from "next/server";

import { BannerBlock } from "@/blocks/Banner/Component";
import { CodeBlock, type CodeBlockProps } from "@/blocks/Code/Component";
import { MediaBlock } from "@/blocks/MediaBlock/Component";
import { Callout } from "@/components/richtext/Callout";
import {
  detectQuoteCallout,
  prepareArticleRichText,
  type CalloutVariant,
} from "@/components/richtext/prepare-article-content";
import { TableOfContents } from "@/components/richtext/TableOfContents";
import { cn } from "@/lib/cn";
import type {
  BannerBlock as BannerBlockProps,
  MediaBlock as MediaBlockProps,
} from "@/payload-types";

type NodeTypes =
  | SerializedBlockNode<BannerBlockProps>
  | SerializedBlockNode<CodeBlockProps>
  | SerializedBlockNode<MediaBlockProps>;

type HeadingNodeWithId = SerializedHeadingNode & { id?: string };

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

const CALLOUT_STRIP: Record<CalloutVariant, RegExp> = {
  note: /^\s*note:?\s*/i,
  tip: /^\s*tip:?\s*/i,
  warning: /^\s*warning:?\s*/i,
  important: /^\s*important:?\s*/i,
  caution: /^\s*caution:?\s*/i,
};

/**
 * Removes the leading callout label from quote children so the Callout chrome owns it.
 */
function stripCalloutLabelChildren(
  node: SerializedQuoteNode,
  variant: CalloutVariant,
): SerializedQuoteNode["children"] {
  const strip = CALLOUT_STRIP[variant];
  const children = structuredClone(node.children);

  for (const child of children) {
    if (child.type !== "text") continue;
    const textNode = child as unknown as { type: "text"; text: string };
    if (typeof textNode.text !== "string") continue;
    const next = textNode.text.replace(strip, "");
    if (next === textNode.text) break;
    textNode.text = next;
    break;
  }

  return children.filter((child) => {
    if (child.type !== "text") return true;
    return (child as unknown as { text?: string }).text !== "";
  });
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  heading: ({ node, nodesToJSX }) => {
    const heading = node as HeadingNodeWithId;
    const children = nodesToJSX({ nodes: heading.children });
    const Tag = heading.tag;
    const id = typeof heading.id === "string" && heading.id.length > 0 ? heading.id : undefined;
    return (
      <Tag id={id} className="scroll-mt-28">
        {children}
      </Tag>
    );
  },
  quote: ({ node, nodesToJSX }) => {
    const variant = detectQuoteCallout(node);
    if (variant) {
      const bodyNodes = stripCalloutLabelChildren(node, variant);
      const children = nodesToJSX({ nodes: bodyNodes });
      return <Callout variant={variant}>{children}</Callout>;
    }
    const children = nodesToJSX({ nodes: node.children });
    return <blockquote>{children}</blockquote>;
  },
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
  /** When true, replace imported TOC lists with a styled contents nav + heading anchors. */
  enhanceArticle?: boolean;
};

/**
 * Wraps a slice of Lexical children into a valid editor state for ConvertRichText.
 */
function sliceEditorState(
  data: DefaultTypedEditorState,
  start: number,
  end: number,
): DefaultTypedEditorState | null {
  const children = data.root.children.slice(start, end);
  if (children.length === 0) return null;
  return {
    ...data,
    root: {
      ...data.root,
      children,
    },
  };
}

/**
 * Renders Payload Lexical rich text with Code / Banner / Media blocks,
 * GFM-style callouts, heading anchors, and an optional contents nav.
 *
 * `connection()` opts this subtree into request time so Payload's Lexical
 * converter can call `randomUUID()` under Cache Components.
 */
export async function RichText({
  className,
  data,
  enableGutter = true,
  enableProse = true,
  enhanceArticle = true,
}: Props) {
  await connection();

  const prepared = enhanceArticle ? prepareArticleRichText(data) : null;
  const editorData = prepared?.data ?? data;
  const shellClass = cn(
    "payload-richtext",
    {
      container: enableGutter,
      "max-w-none": !enableGutter,
      "prose prose-invert mx-auto md:prose-lg": enableProse,
    },
    className,
  );

  if (!prepared || prepared.toc.length === 0) {
    return <ConvertRichText converters={jsxConverters} data={editorData} className={shellClass} />;
  }

  const before = sliceEditorState(editorData, 0, prepared.tocInsertIndex);
  const after = sliceEditorState(
    editorData,
    prepared.tocInsertIndex,
    editorData.root.children.length,
  );

  return (
    <div className={shellClass}>
      {before ? <ConvertRichText converters={jsxConverters} data={before} /> : null}
      <TableOfContents items={prepared.toc} />
      {after ? <ConvertRichText converters={jsxConverters} data={after} /> : null}
    </div>
  );
}
