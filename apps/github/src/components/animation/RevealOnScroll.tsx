import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  delay?: "none" | "short" | "medium" | "long";
  variant?: "default" | "fade";
};

const delayClasses = {
  none: "",
  short: "landing-scroll-reveal-delay-short",
  medium: "landing-scroll-reveal-delay-medium",
  long: "landing-scroll-reveal-delay-long",
} satisfies Record<NonNullable<RevealOnScrollProps["delay"]>, string>;

const variantClasses = {
  default: "",
  fade: "landing-scroll-reveal-fade",
} satisfies Record<NonNullable<RevealOnScrollProps["variant"]>, string>;

/**
 * CSS view-timeline scroll reveal. Prefer `ScrollReveal` from `@repo/ui/landing` on landing pages.
 */
export function RevealOnScroll({
  children,
  className,
  delay = "none",
  variant = "default",
}: RevealOnScrollProps) {
  return (
    <div
      className={twMerge(
        "landing-scroll-reveal",
        variantClasses[variant],
        delayClasses[delay],
        className,
      )}
    >
      {children}
    </div>
  );
}
