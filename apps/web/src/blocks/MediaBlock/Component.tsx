import Image from "next/image";
import type { MediaBlock as MediaBlockProps } from "@/payload-types";
import { cn } from "@/lib/cn";
import { resolveMediaUrl } from "@/utils/media-url";

type Props = MediaBlockProps & {
  className?: string;
  imgClassName?: string;
};

type ResolvedImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * Resolves either an uploaded Payload media doc or a remote Image URL field.
 */
function resolveBlockImage(fields: MediaBlockProps): ResolvedImage | null {
  const media = fields.media;
  if (media && typeof media === "object") {
    const src = resolveMediaUrl(media.url);
    if (src) {
      return {
        src,
        alt: media.alt || fields.alt || "",
        width: media.width ?? 1200,
        height: media.height ?? 675,
      };
    }
  }

  const src = resolveMediaUrl(fields.url);
  if (!src) return null;

  return {
    src,
    alt: fields.alt || "",
    width: 1200,
    height: 675,
  };
}

/**
 * Image block embedded in Lexical content — upload or remote URL.
 */
export function MediaBlock({ className, imgClassName, ...fields }: Props) {
  const image = resolveBlockImage(fields);
  if (!image) return null;

  return (
    <figure className={cn("not-prose my-8", className)}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        className={cn("h-auto w-full rounded-xl object-cover", imgClassName)}
      />
      {image.alt ? (
        <figcaption className="mt-3 text-center text-sm text-base-content/55">
          {image.alt}
        </figcaption>
      ) : null}
    </figure>
  );
}
