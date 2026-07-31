"use client";

import Image from "next/image";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

type ProjectMediaSize = "card" | "hero";

type ProjectOgPlaceholderProps = {
  name: string;
  nameWithOwner: string;
  className?: string;
  /** Larger type + padding for the detail hero. */
  size?: ProjectMediaSize;
};

const PLACEHOLDER_PAD: Record<ProjectMediaSize, string> = {
  card: "space-y-1 px-4 py-3",
  hero: "space-y-2 px-6 py-5 md:px-8 md:py-6",
};

const PLACEHOLDER_OWNER_TYPE: Record<ProjectMediaSize, string> = {
  card: "text-[10px]",
  hero: "text-xs",
};

const PLACEHOLDER_NAME_TYPE: Record<ProjectMediaSize, string> = {
  card: "text-xl",
  hero: "text-3xl md:text-4xl",
};

const MEDIA_FRAME: Record<ProjectMediaSize, string> = {
  card: "h-48",
  hero: "h-56 w-full md:h-72",
};

const MEDIA_SIZES: Record<ProjectMediaSize, string> = {
  card: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  hero: "(max-width: 768px) 100vw, 64rem",
};

/**
 * Resolves owner from a `owner/repo` slug.
 */
function ownerFromNameWithOwner(nameWithOwner: string) {
  if (!nameWithOwner.includes("/")) return nameWithOwner;
  return nameWithOwner.split("/")[0] ?? nameWithOwner;
}

/**
 * Client-only framed stand-in for a missing/expired GitHub social preview.
 * Pure CSS — no OG route, no canvas, no server image generation.
 */
export function ProjectOgPlaceholder({
  name,
  nameWithOwner,
  className,
  size = "card",
}: ProjectOgPlaceholderProps) {
  const owner = ownerFromNameWithOwner(nameWithOwner);

  return (
    <div
      role="img"
      aria-label={`${nameWithOwner} preview`}
      data-test="project-og-placeholder"
      className={twMerge(
        "relative flex h-full w-full flex-col justify-end overflow-hidden",
        "bg-linear-to-br from-landing-gradient-mid-from via-landing-panel to-landing-gradient-mid-to",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--color-landing-cream) 35%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-landing-cream) 35%, transparent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-landing-cream/6 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-12 size-56 rounded-full bg-landing-sage/10 blur-3xl"
      />

      <div
        className={twMerge(
          "relative z-10 border-t border-landing-cream/10 bg-landing-panel/55 backdrop-blur-[2px]",
          PLACEHOLDER_PAD[size],
        )}
      >
        <p
          className={twMerge(
            "font-mono tracking-[0.18em] text-landing-sage/55 uppercase",
            PLACEHOLDER_OWNER_TYPE[size],
          )}
        >
          {owner}
        </p>
        <p
          className={twMerge(
            "truncate font-serif leading-none tracking-[-0.03em] text-landing-cream",
            PLACEHOLDER_NAME_TYPE[size],
          )}
        >
          {name}
        </p>
      </div>
    </div>
  );
}

type ProjectMediaProps = {
  name: string;
  nameWithOwner: string;
  openGraphImageUrl?: string | null;
  /** Height / layout classes for the media frame. */
  className?: string;
  size?: ProjectMediaSize;
};

/**
 * Remote GitHub OG image when available; otherwise a client-side name plate.
 * Failed / expired signed URLs swap to the placeholder without a static asset.
 */
export function ProjectMedia({
  name,
  nameWithOwner,
  openGraphImageUrl,
  className,
  size = "card",
}: ProjectMediaProps) {
  const [failed, setFailed] = useState(false);

  const remoteImageUrl = openGraphImageUrl?.trim() || null;
  const showRemote = Boolean(remoteImageUrl) && !failed;

  const frameClassName = twMerge(
    "landing-card-media relative shrink-0 overflow-hidden",
    MEDIA_FRAME[size],
    className,
  );

  if (!showRemote || !remoteImageUrl) {
    return (
      <div className={frameClassName}>
        <ProjectOgPlaceholder name={name} nameWithOwner={nameWithOwner} size={size} />
      </div>
    );
  }

  return (
    <div className={frameClassName}>
      <Image
        src={remoteImageUrl}
        alt={name}
        fill
        sizes={MEDIA_SIZES[size]}
        // Signed GitHub social-preview URLs break when proxied through the optimizer.
        unoptimized={remoteImageUrl.includes("repository-images.githubusercontent.com")}
        onError={() => setFailed(true)}
        className="landing-card-media-image object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-landing-panel via-landing-panel/10 to-transparent" />
    </div>
  );
}
