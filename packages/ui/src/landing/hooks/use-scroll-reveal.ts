import { animate } from "animejs";
import { useEffect, type RefObject } from "react";

interface ScrollRevealOptions {
  delay?: number;
  y?: number;
  variant?: "default" | "fade";
}

function revealImmediately(
  element: HTMLElement,
  y: number,
  delay: number,
  variant: "default" | "fade",
) {
  if (variant === "fade") {
    return animate(element, {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 500,
      ease: "outCubic",
      delay: delay * 1000,
    });
  }

  return animate(element, {
    opacity: [0, 1],
    translateY: [y, 0],
    scale: [0.97, 1],
    filter: ["blur(10px)", "blur(0px)"],
    duration: 700,
    ease: "outQuart",
    delay: delay * 1000,
  });
}

function isInView(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

function primeHiddenState(element: HTMLElement, y: number, variant: "default" | "fade") {
  element.style.opacity = "0";
  if (variant === "fade") {
    element.style.transform = "translateY(10px)";
    return;
  }
  element.style.transform = `translateY(${y}px) scale(0.97)`;
  element.style.filter = "blur(10px)";
}

export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  { delay = 0, y = 48, variant = "default" }: ScrollRevealOptions = {},
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.style.opacity = "1";
      element.style.transform = "none";
      element.style.filter = "none";
      return;
    }

    let anim: ReturnType<typeof animate> | undefined;
    let revealed = false;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      anim = revealImmediately(element, y, delay, variant);
    };

    if (isInView(element)) {
      // Already on screen at mount — leave as-is. Animating from a hidden
      // start after first paint is what made the landing page bounce.
      return;
    }

    primeHiddenState(element, y, variant);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      anim?.revert();
    };
  }, [ref, delay, y, variant]);
}
