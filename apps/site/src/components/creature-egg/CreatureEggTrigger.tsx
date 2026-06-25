import { Link } from "@tanstack/react-router";
import { animate } from "animejs";
import { useEffect, useRef, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type CreatureEggTriggerProps = {
  children?: ReactNode;
  className?: string;
  "data-test"?: string;
  "aria-label"?: string;
};

export function CreatureEggTrigger({
  children = ".",
  className,
  "data-test": dataTest = "creature-feature-egg",
  "aria-label": ariaLabel = "creature feature",
}: CreatureEggTriggerProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const anim = animate(el, {
      translateY: ["0em", "-0.42em", "0em", "-0.28em", "0em", "-0.14em", "0em"],
      duration: 720,
      ease: "outQuad",
    });

    return () => {
      anim.revert();
    };
  }, []);

  return (
    <Link
      ref={ref}
      to="/creature-feature"
      data-test={dataTest}
      aria-label={ariaLabel}
      className={twMerge(
        "inline-block text-primary transition-opacity hover:opacity-70",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function CreatureEggLowercaseI({ className }: { className?: string }) {
  return (
    <span className={twMerge("relative inline-block align-baseline", className)}>
      <span className="inline-block pt-[0.52em] leading-none">ı</span>
      <CreatureEggTrigger
        className="absolute top-0 left-1/2 -translate-x-1/2 font-serif text-[1.18em] leading-none"
        data-test="creature-feature-egg-i"
      />
    </span>
  );
}

export function CreatureEggCapitalI({ className }: { className?: string }) {
  return (
    <span className={twMerge("relative inline-block align-baseline", className)}>
      <span>I</span>
      <CreatureEggTrigger
        className="absolute -top-[0.42em] left-1/2 -translate-x-1/2 font-serif text-[0.62em] leading-none"
        data-test="creature-feature-egg-capital-i"
      />
    </span>
  );
}
