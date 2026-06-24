import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import type { LandingSectionProps, OrganicDividerProps, ScrollRevealProps } from "@/types/landing";
import { useRef, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

const sectionToneClasses = {
  base: "bg-base-100",
  muted: "bg-base-200",
  deep: "bg-[#151811]",
  olive: "bg-[#687054]",
  cream: "bg-[#d6d0b7] text-[#1a1c14]",
} satisfies Record<NonNullable<LandingSectionProps["tone"]>, string>;

const dividerToneClasses = {
  base: "text-base-100",
  muted: "text-base-200",
  deep: "text-[#151811]",
  olive: "text-[#687054]",
  cream: "text-[#d6d0b7]",
} satisfies Record<NonNullable<OrganicDividerProps["tone"]>, string>;

const revealDelaySeconds = {
  none: 0,
  short: 0.12,
  medium: 0.24,
  long: 0.36,
} satisfies Record<NonNullable<ScrollRevealProps["delay"]>, number>;

export function LandingSection({
  children,
  className,
  dataTest,
  id,
  tone = "base",
}: LandingSectionProps) {
  return (
    <section
      id={id}
      data-test={dataTest}
      className={twMerge(
        "relative scroll-mt-20 overflow-hidden py-24 md:py-32",
        sectionToneClasses[tone],
        className,
      )}
    >
      {children}
    </section>
  );
}

export function ScrollReveal({ children, className, delay = "none" }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollReveal(ref, { delay: revealDelaySeconds[delay] });

  return (
    <div ref={ref} className={twMerge(className)}>
      {children}
    </div>
  );
}

export function OrganicDivider({ className, flip = false, tone = "base" }: OrganicDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={twMerge(
        "pointer-events-none absolute right-0 left-0 z-10 h-20 overflow-hidden",
        flip ? "-bottom-px rotate-180" : "-top-px",
        dividerToneClasses[tone],
        className,
      )}
    >
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="h-full w-full fill-current">
        <path d="M0 68L60 62C120 56 240 44 360 47C480 50 600 68 720 76C840 84 960 82 1080 70C1200 58 1320 36 1380 25L1440 14V120H0V68Z" />
        <path
          d="M0 92L80 84C160 76 320 60 480 65C640 70 800 96 960 94C1120 92 1280 62 1360 47L1440 32V120H0V92Z"
          opacity="0.42"
        />
      </svg>
    </div>
  );
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-xs font-semibold tracking-[0.38em] text-primary uppercase">
      {children}
    </p>
  );
}
