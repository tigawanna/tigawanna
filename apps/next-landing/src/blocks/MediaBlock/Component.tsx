import Image from "next/image";
import type { MediaBlock as MediaBlockProps } from "@/payload-types";
import { cn } from "@/lib/cn";

type Props = MediaBlockProps & {
  className?: string;
  imgClassName?: string;
};

/**
 * Resolves a Payload media upload URL for next/image.
 */
function mediaUrl(media: MediaBlockProps["media"]): string | null {
  if (!media || typeof media !== "object") return null;
  if (!media.url) return null;
  return media.url.startsWith("http") ? media.url : media.url;
}

/**
 * Image block embedded in journal Lexical content.
 */
export function MediaBlock({ className, imgClassName, media }: Props) {
  const url = mediaUrl(media);
  if (!url || typeof media !== "object") return null;

  const alt = media.alt || "";
  const width = media.width ?? 1200;
  const height = media.height ?? 675;

  return (
    <figure className={cn("not-prose my-8", className)}>
      <Image
        src={url}
        alt={alt}
        width={width}
        height={height}
        className={cn("h-auto w-full rounded-xl object-cover", imgClassName)}
      />
      {alt ? (
        <figcaption className="mt-3 text-center text-sm text-base-content/55">{alt}</figcaption>
      ) : null}
    </figure>
  );
}
