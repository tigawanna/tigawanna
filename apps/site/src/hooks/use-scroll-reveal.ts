import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, type RefObject } from "react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

interface ScrollRevealOptions {
  delay?: number;
  y?: number;
  start?: string;
}

export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  { delay = 0, y = 48, start = "top 85%" }: ScrollRevealOptions = {},
) {
  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.from(element, {
        opacity: 0,
        y,
        scale: 0.97,
        filter: "blur(10px)",
        duration: 0.85,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start,
          once: true,
        },
      });
    }, element);

    return () => context.revert();
  }, [ref, delay, y, start]);
}
