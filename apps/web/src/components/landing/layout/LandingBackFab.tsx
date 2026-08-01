"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { twMerge } from "tailwind-merge";

/**
 * Compact navbar back control — icon only, no glass chrome.
 */
export function LandingBackFab({
  href = "/#projects",
  label = "Back to projects",
  className,
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      transitionTypes={["nav-back"]}
      aria-label={label}
      data-test="landing-back-fab"
      className={twMerge(
        "flex size-8 shrink-0 items-center justify-center md:size-9",
        "text-landing-sage/75 transition-colors hover:text-landing-sage",
        "active:scale-[0.96]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-cream",
        className,
      )}
    >
      <ChevronLeft className="size-5 stroke-[1.75] md:size-6" aria-hidden="true" />
    </Link>
  );
}
