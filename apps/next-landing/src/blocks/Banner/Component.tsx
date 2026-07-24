import type { BannerBlock as BannerBlockProps } from "@/payload-types";
import {
  RichText as ConvertRichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
} & BannerBlockProps;

const bannerConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
});

const styleClasses = {
  info: "border-info/40 bg-info/10 text-info-content",
  warning: "border-warning/40 bg-warning/10 text-warning-content",
  error: "border-error/40 bg-error/10 text-error-content",
  success: "border-success/40 bg-success/10 text-success-content",
} as const;

/**
 * Callout banner embedded in journal Lexical content.
 */
export function BannerBlock({ className, content, style }: Props) {
  return (
    <div
      className={cn(
        "not-prose my-6 rounded-xl border px-5 py-4 text-sm leading-7",
        styleClasses[style ?? "info"],
        className,
      )}
    >
      <ConvertRichText
        data={content as SerializedEditorState}
        converters={bannerConverters}
      />
    </div>
  );
}
