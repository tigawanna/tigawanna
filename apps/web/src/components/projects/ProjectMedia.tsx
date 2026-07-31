"use client";

import Image from "next/image";
import { GitFork, Github, Star } from "lucide-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

type ProjectMediaSize = "card" | "hero";

type ProjectOgPlaceholderProps = {
  name: string;
  nameWithOwner: string;
  description?: string | null;
  stargazerCount?: number | null;
  forkCount?: number | null;
  className?: string;
  size?: ProjectMediaSize;
};

const MEDIA_FRAME: Record<ProjectMediaSize, string> = {
  card: "h-48",
  hero: "h-56 w-full md:h-72",
};

const MEDIA_SIZES: Record<ProjectMediaSize, string> = {
  card: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  hero: "(max-width: 768px) 100vw, 64rem",
};

const OG_PAD: Record<ProjectMediaSize, string> = {
  card: "gap-3 p-4",
  hero: "gap-4 p-5 md:gap-5 md:p-7",
};

const OG_TITLE: Record<ProjectMediaSize, string> = {
  card: "text-base leading-snug",
  hero: "text-xl leading-snug md:text-2xl",
};

const OG_DESC: Record<ProjectMediaSize, string> = {
  card: "line-clamp-2 text-xs leading-5",
  hero: "line-clamp-3 text-sm leading-6 md:text-base md:leading-7",
};

const OG_STAT: Record<ProjectMediaSize, string> = {
  card: "gap-1 text-[11px]",
  hero: "gap-1.5 text-xs md:text-sm",
};

const OG_ICON: Record<ProjectMediaSize, string> = {
  card: "size-4",
  hero: "size-5",
};

/**
 * Formats a count the way GitHub OG cards often do (`1.2k`).
 */
function formatStatCount(value: number) {
  if (value < 1000) return String(value);
  const compact = value / 1000;
  const rounded = compact >= 10 ? Math.round(compact) : Math.round(compact * 10) / 10;
  return `${rounded}k`;
}

/**
 * Splits `owner/repo` for the GitHub-style title row.
 */
function splitNameWithOwner(nameWithOwner: string) {
  const slash = nameWithOwner.indexOf("/");
  if (slash <= 0) {
    return { owner: nameWithOwner, repo: nameWithOwner };
  }
  return {
    owner: nameWithOwner.slice(0, slash),
    repo: nameWithOwner.slice(slash + 1),
  };
}

/**
 * Themed mock of GitHub's default social-preview card (dark panel, cream type).
 * Client-only — no OG route / image generation.
 */
export function ProjectOgPlaceholder({
  name,
  nameWithOwner,
  description,
  stargazerCount,
  forkCount,
  className,
  size = "card",
}: ProjectOgPlaceholderProps) {
  const { owner, repo } = splitNameWithOwner(nameWithOwner);
  const stars = stargazerCount ?? 0;
  const forks = forkCount ?? 0;
  const blurb = description?.trim() || null;

  return (
    <div
      role="img"
      aria-label={`${nameWithOwner} preview`}
      data-test="project-og-placeholder"
      className={twMerge(
        "relative flex h-full w-full overflow-hidden bg-landing-panel text-landing-cream",
        className,
      )}
    >
      <div className={twMerge("relative z-10 flex min-w-0 flex-1 flex-col", OG_PAD[size])}>
        <div className="min-w-0 flex-1">
          <p className={twMerge("truncate font-sans tracking-tight", OG_TITLE[size])}>
            <span className="font-normal text-landing-sage/55">{owner}/</span>
            <span className="font-semibold text-landing-cream">{repo || name}</span>
          </p>
          {blurb ? (
            <p className={twMerge("mt-2 text-landing-sage/70", OG_DESC[size])}>{blurb}</p>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div
            className={twMerge("flex flex-wrap items-center text-landing-sage/45", OG_STAT[size])}
          >
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5" strokeWidth={1.75} />
              {formatStatCount(stars)}
            </span>
            <span className="mx-2 text-landing-sage/25" aria-hidden>
              ·
            </span>
            <span className="inline-flex items-center gap-1">
              <GitFork className="size-3.5" strokeWidth={1.75} />
              {formatStatCount(forks)}
            </span>
          </div>

          <Github
            aria-hidden
            fill="currentColor"
            strokeWidth={0}
            className={twMerge("shrink-0 text-landing-sage/40", OG_ICON[size])}
          />
        </div>
      </div>
    </div>
  );
}

type ProjectMediaProps = {
  name: string;
  nameWithOwner: string;
  description?: string | null;
  stargazerCount?: number | null;
  forkCount?: number | null;
  openGraphImageUrl?: string | null;
  /** Height / layout classes for the media frame. */
  className?: string;
  size?: ProjectMediaSize;
};

/**
 * Remote GitHub OG image when available; otherwise a themed default-OG mock.
 * Failed / expired signed URLs swap to the placeholder without a static asset.
 */
export function ProjectMedia({
  name,
  nameWithOwner,
  description,
  stargazerCount,
  forkCount,
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
        <ProjectOgPlaceholder
          name={name}
          nameWithOwner={nameWithOwner}
          description={description}
          stargazerCount={stargazerCount}
          forkCount={forkCount}
          size={size}
        />
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
