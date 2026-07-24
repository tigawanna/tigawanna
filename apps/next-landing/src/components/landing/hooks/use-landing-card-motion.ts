"use client";

import { useEffect, type RefObject } from "react";

/**
 * Tracks pointer position for the landing-card glow gradient.
 * Intentionally no lift/scale — that fought soft navigations / view transitions.
 */
export function useLandingCardMotion(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const card = ref.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const setGlowPosition = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--landing-card-glow-x", `${x}%`);
      card.style.setProperty("--landing-card-glow-y", `${y}%`);
    };

    const handleFocus = () => {
      card.style.setProperty("--landing-card-glow-x", "50%");
      card.style.setProperty("--landing-card-glow-y", "24%");
    };

    card.addEventListener("pointermove", setGlowPosition);
    card.addEventListener("focusin", handleFocus);

    return () => {
      card.removeEventListener("pointermove", setGlowPosition);
      card.removeEventListener("focusin", handleFocus);
    };
  }, [ref]);
}
