"use client";

import { playCreatureCurtainClose } from "@/components/creature-egg/play-creature-curtain-close";
import { animate, createTimeline } from "animejs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { twMerge } from "tailwind-merge";

/** How long the mid-screen egg stays clickable once shown. */
const EGG_VISIBLE_MS = 3500;
/** Wait this long after the scroll FAB first appears before considering a flash. */
const INITIAL_DELAY_MS = 8000;
/** Minimum gap between flash attempts. */
const RETRY_GAP_MS = 22_000;
/** Chance that a flash attempt actually shows the egg. */
const SHOW_PROBABILITY = 0.35;

type CreatureEggFlashProps = {
  /** Only schedule flashes while the scroll FAB is interactively visible. */
  fabVisible: boolean;
};

/**
 * Rare mid-screen creature egg. While the scroll FAB is active, randomly
 * appears center-screen for a few seconds; click runs the curtain transition
 * and navigates to `/creature-feature`. Keeps landing copy unsplit for tests.
 */
export function CreatureEggFlash({ fabVisible }: CreatureEggFlashProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const anim = animate(el, {
      marginTop: ["0em", "-0.12em"],
      duration: 2400,
      ease: "inOutSine",
      loop: true,
      alternate: true,
    });

    return () => {
      anim.revert();
    };
  }, [visible]);

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
    <button
      ref={eggRef}
      type="button"
      data-test="creature-feature-egg"
      aria-label="creature feature"
      onClick={handleClick}
      className={twMerge(
        "fixed top-1/2 left-1/2 z-45 -translate-x-1/2 -translate-y-1/2",
        "inline-flex min-h-12 min-w-12 items-center justify-center rounded-full",
        "border border-landing-cream/25 bg-landing-cream/15 text-2xl text-landing-cream",
        "shadow-[0_12px_40px_rgb(0_0_0/0.35)] backdrop-blur-md",
        "transition-[opacity,transform] duration-300 ease-out",
        "hover:bg-landing-cream/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-landing-cream",
      )}
    >
      .
    </button>
  );
}
