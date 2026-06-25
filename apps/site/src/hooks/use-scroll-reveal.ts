import { animate, onScroll } from "animejs";
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

    const mountReveal = () => {
      if (isInView(element)) {
        anim = revealImmediately(element, y, delay, variant);
        return;
      }

      if (variant === "fade") {
        anim = animate(element, {
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 500,
          ease: "outCubic",
          delay: delay * 1000,
          autoplay: onScroll({
            target: element,
            enter: "top 88%",
            leave: "top",
            sync: false,
            repeat: false,
          }),
        });
        return;
      }

      anim = animate(element, {
        opacity: [0, 1],
        translateY: [y, 0],
        scale: [0.97, 1],
        filter: ["blur(10px)", "blur(0px)"],
        duration: 700,
        ease: "outQuart",
        delay: delay * 1000,
        autoplay: onScroll({
          target: element,
          enter: "top 88%",
          leave: "top",
          sync: false,
          repeat: false,
        }),
      });
    };

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(mountReveal);
    });

    return () => {
      cancelAnimationFrame(frame);
      anim?.revert();
    };
  }, [ref, delay, y, variant]);
}
