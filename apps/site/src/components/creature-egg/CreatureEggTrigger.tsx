import { Link, useNavigate } from "@tanstack/react-router";
import { animate, createTimeline } from "animejs";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { playCreatureCurtainClose } from "./play-creature-curtain-close";

const EGG_BOB_ANIMATION = {
  marginTop: ["0em", "-0.1em"],
  duration: 2800,
  ease: "inOutSine",
  loop: true,
  alternate: true,
} as const;

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
  const navigate = useNavigate();

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const anim = animate(el, EGG_BOB_ANIMATION);

    return () => {
      anim.revert();
    };
  }, []);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const el = ref.current;

    const go = () => {
      playCreatureCurtainClose(() => {
        void navigate({ to: "/creature-feature" });
      });
    };

    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      go();
      return;
    }

    const ripple = document.createElement("span");
    ripple.setAttribute("aria-hidden", "true");
    ripple.className =
      "pointer-events-none fixed z-9998 rounded-full bg-[#ff5b51] opacity-70 mix-blend-screen";
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2.4;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${rect.left + rect.width / 2 - size / 2}px`;
    ripple.style.top = `${rect.top + rect.height / 2 - size / 2}px`;
    document.body.appendChild(ripple);

    const timeline = createTimeline({
      onComplete: () => {
        ripple.remove();
        go();
      },
    });

    timeline
      .add(el, {
        scale: [1, 2.4, 1.6],
        rotate: [0, -8, 0],
        duration: 520,
        ease: "outQuart",
      })
      .add(
        ripple,
        {
          scale: [0.2, 18],
          opacity: [0.75, 0],
          duration: 720,
          ease: "outQuart",
        },
        80,
      );
  }

  return (
    <Link
      ref={ref}
      to="/creature-feature"
      onClick={handleClick}
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
    <span className={twMerge("relative inline-block align-baseline leading-none", className)}>
      <span className="inline-block pt-[0.5em] leading-none" aria-hidden="true">
        ı
      </span>
      <CreatureEggTrigger
        className="absolute top-0 left-1/2 -translate-x-1/2 leading-none"
        data-test="creature-feature-egg-i"
      />
    </span>
  );
}

export function CreatureEggCapitalI({ className }: { className?: string }) {
  return (
    <span className={twMerge("relative inline-block align-baseline leading-none", className)}>
      <span className="inline-block pt-[0.35em] leading-none">I</span>
      <CreatureEggTrigger
        className="absolute top-0 left-1/2 -translate-x-1/2 text-[0.55em] leading-none"
        data-test="creature-feature-egg-capital-i"
      />
    </span>
  );
}
