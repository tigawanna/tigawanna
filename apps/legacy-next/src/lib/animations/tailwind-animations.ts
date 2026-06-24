"use client";

import { useEffect, useState } from "react";

/**
 * A hook that respects the user's preference for reduced motion
 * @returns Boolean indicating if reduced motion is preferred
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      // Listen for changes
      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }
    return undefined;
  }, []);

  return prefersReducedMotion;
}

/**
 * A utility to conditionally include Tailwind animation classes
 * based on the user's preference for reduced motion
 * 
 * @param animationClasses - Tailwind animation classes to apply when animations are enabled
 * @returns The animation classes or an empty string if reduced motion is preferred
 */
export function useAnimationClasses(animationClasses: string): string {
  const prefersReducedMotion = usePrefersReducedMotion();
  return prefersReducedMotion ? "" : animationClasses;
}

/**
 * A utility to create delay class strings for Tailwind animations
 * @param delay - Delay in seconds
 * @returns Tailwind delay class
 */
export function getDelayClass(delay: number): string {
  // Convert number to proper delay class
  const delayMap: Record<number, string> = {
    0: "",
    0.1: "delay-100",
    0.2: "delay-200",
    0.3: "delay-300",
    0.4: "delay-400",
    0.5: "delay-500",
    0.6: "delay-600",
    0.7: "delay-700",
    0.8: "delay-800",
    0.9: "delay-900",
    1: "delay-1000",
  };

  return delayMap[delay] || "";
}
