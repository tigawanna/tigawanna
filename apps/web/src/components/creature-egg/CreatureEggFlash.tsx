"use client";

import { playCreatureCurtainClose } from "@/components/creature-egg/play-creature-curtain-close";
import { animate, createTimeline } from "animejs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { twMerge } from "tailwind-merge";

/** How long the edge-peek egg stays clickable once shown. */
const EGG_VISIBLE_MS = 4200;
/** Wait this long after the scroll FAB first appears before considering a flash. */
const INITIAL_DELAY_MS = 8000;
/** Minimum gap between flash attempts. */
const RETRY_GAP_MS = 22_000;
/** Chance that a flash attempt actually shows the egg. */
const SHOW_PROBABILITY = 0.35;
/** Keep peeks away from the very top/bottom of the viewport. */
const TOP_MIN_VH = 18;
const TOP_MAX_VH = 72;

type PeekSide = "left" | "right";

type PeekPlacement = {
  side: PeekSide;
  topVh: number;
};

type CreatureEggFlashProps = {
  /** Only schedule flashes while the scroll FAB is interactively visible. */
  fabVisible: boolean;
};

/**
 * Picks a random viewport edge placement for the creature egg.
 * Left or right, at a height between {@link TOP_MIN_VH} and {@link TOP_MAX_VH}.
 */
function randomPeekPlacement(): PeekPlacement {
  return {
    side: Math.random() < 0.5 ? "left" : "right",
    topVh: TOP_MIN_VH + Math.random() * (TOP_MAX_VH - TOP_MIN_VH),
  };
}

/**
 * Rare edge-peek creature egg. While the scroll FAB is active, a spider
 * randomly peeks from the left or right window edge at a random height;
 * click runs the curtain transition and navigates to `/creature-feature`.
 */
export function CreatureEggFlash({ fabVisible }: CreatureEggFlashProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [placement, setPlacement] = useState<PeekPlacement>(() => randomPeekPlacement());
  const eggRef = useRef<HTMLButtonElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const scheduleTimerRef = useRef<number | null>(null);
  const armedRef = useRef(false);

  useEffect(() => {
    if (!fabVisible) {
      setVisible(false);
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      if (scheduleTimerRef.current !== null) {
        window.clearTimeout(scheduleTimerRef.current);
        scheduleTimerRef.current = null;
      }
      armedRef.current = false;
      return;
    }

    if (armedRef.current) return;
    armedRef.current = true;

    const tryFlash = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        scheduleTimerRef.current = window.setTimeout(tryFlash, RETRY_GAP_MS);
        return;
      }

      if (Math.random() > SHOW_PROBABILITY) {
        scheduleTimerRef.current = window.setTimeout(tryFlash, RETRY_GAP_MS);
        return;
      }

      setPlacement(randomPeekPlacement());
      setVisible(true);
      hideTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        hideTimerRef.current = null;
        scheduleTimerRef.current = window.setTimeout(tryFlash, RETRY_GAP_MS);
      }, EGG_VISIBLE_MS);
    };

    scheduleTimerRef.current = window.setTimeout(tryFlash, INITIAL_DELAY_MS);

    return () => {
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
      if (scheduleTimerRef.current !== null) window.clearTimeout(scheduleTimerRef.current);
    };
  }, [fabVisible]);

  useEffect(() => {
    const el = eggRef.current;
    if (!el || !visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1";
      return;
    }

    const inward = placement.side === "left" ? 1 : -1;
    let wiggle: ReturnType<typeof animate> | null = null;
    let cancelled = false;

    const enter = animate(el, {
      translateX: [inward * -18, 0],
      opacity: [0, 1],
      duration: 560,
      ease: "outBack",
      onComplete: () => {
        if (cancelled) return;
        wiggle = animate(el, {
          translateY: ["0px", "-5px", "0px", "4px", "0px"],
          rotate: [0, inward * 5, 0, inward * -4, 0],
          duration: 2600,
          ease: "inOutSine",
          loop: true,
        });
      },
    });

    return () => {
      cancelled = true;
      enter.revert();
      wiggle?.revert();
    };
  }, [visible, placement.side]);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const el = eggRef.current;

    const go = () => {
      playCreatureCurtainClose(() => {
        router.push("/creature-feature");
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

  if (!visible) return null;

  return (
    <div
      className={twMerge(
        "pointer-events-none fixed z-45 -translate-y-1/2",
        placement.side === "left" ? "left-0" : "right-0",
      )}
      style={{ top: `${placement.topVh}vh` }}
    >
      {/* Static peek offset stays outside anime transforms on the button. */}
      <div
        className={twMerge(placement.side === "left" ? "translate-x-[-45%]" : "translate-x-[45%]")}
      >
        <button
          ref={eggRef}
          type="button"
          data-test="creature-feature-egg"
          data-side={placement.side}
          aria-label="creature feature"
          onClick={handleClick}
          className={twMerge(
            "pointer-events-auto inline-flex size-14 items-center justify-center opacity-0",
            "text-landing-cream/75 drop-shadow-[0_8px_24px_rgb(0_0_0/0.55)]",
            "transition-colors duration-300 ease-out",
            "hover:text-[#ff5b51] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-cream",
          )}
        >
          <span
            className={twMerge(
              "inline-flex",
              placement.side === "right" ? "-scale-x-100" : undefined,
            )}
          >
            <SpiderIcon className="size-10" />
          </span>
        </button>
      </div>
    </div>
  );
}

/**
 * Minimal eight-legged spider mark for the creature-feature edge peek.
 */
function SpiderIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="32" cy="30" rx="7.5" ry="9" fill="currentColor" opacity="0.95" />
      <ellipse cx="32" cy="42" rx="9.5" ry="11" fill="currentColor" />
      <circle cx="28.5" cy="26.5" r="1.4" fill="#050505" />
      <circle cx="35.5" cy="26.5" r="1.4" fill="#050505" />
      <path
        d="M25 28 C12 22 6 14 4 8 M25 32 C10 30 5 34 3 42 M25 36 C12 40 8 48 7 56 M26 39 C16 46 14 54 16 60"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M39 28 C52 22 58 14 60 8 M39 32 C54 30 59 34 61 42 M39 36 C52 40 56 48 57 56 M38 39 C48 46 50 54 48 60"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M29 34 L27.5 37 M35 34 L36.5 37"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
