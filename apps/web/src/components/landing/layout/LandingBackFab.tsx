"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { twMerge } from "tailwind-merge";

const glassSurfaceClass = twMerge(
  "rounded-full border border-landing-cream/30 bg-landing-cream/20",
  "shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_8px_28px_rgb(0_0_0/0.22)]",
  "backdrop-blur-xl backdrop-saturate-150",
);

/**
 * Fixed top-left back control — same glass blob as the landing scroll FAB,
 * with the arrow swapped to point left.
 */
export function LandingBackFab({
  href = "/#projects",
  label = "Back to projects",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      transitionTypes={["nav-back"]}
      aria-label={label}
      data-test="landing-back-fab"
      className={twMerge(
        "fixed top-24 left-4 z-40 flex size-11 items-center justify-center md:top-28 md:left-7",
        "text-landing-cream transition-[transform,opacity,color,background-color,border-color]",
        "duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        "hover:border-landing-cream/45 hover:bg-landing-cream/28 hover:text-landing-cream-highlight",
        "active:scale-[0.96]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-cream",
        glassSurfaceClass,
      )}
    >
      <ArrowLeft className="size-4.5 stroke-[2.25]" aria-hidden="true" />
    </Link>
  );
}
