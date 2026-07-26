import type { BannerBlock as BannerBlockProps } from "@/payload-types";
import {
  RichText as ConvertRichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { Callout, bannerStyleToCallout } from "@/components/richtext/Callout";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
} & BannerBlockProps;

const bannerConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
});

/**
 * Callout banner embedded in Lexical content (Payload Banner block → GFM-style alert).
 */
export function BannerBlock({ className, content, style }: Props) {
  return (
    <Callout variant={bannerStyleToCallout(style)} className={cn(className)} showLabel>
      <ConvertRichText data={content as SerializedEditorState} converters={bannerConverters} />
    </Callout>
  );
}
