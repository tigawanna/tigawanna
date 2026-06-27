import { createTimeline } from "animejs";
import { useEffect, useRef, type RefObject } from "react";

const CIRCLE_ORIGIN = "50% 100%";
const MIN_RADIUS = 7;
const MAX_RADIUS = 108;
const REVEAL_MS = 900;
const CONTENT_START_RATIO = 0.48;

export function useTechChoiceTransition(
  panelRef: RefObject<HTMLElement | null>,
  activeIndex: number,
) {
  const skipEnterRef = useRef(true);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const content = panel.querySelector<HTMLElement>("[data-tech-choice-content]");

    const showInstant = () => {
      panel.style.clipPath = `circle(${MAX_RADIUS}% at ${CIRCLE_ORIGIN})`;
      if (content) {
        content.style.opacity = "1";
        content.style.transform = "none";
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panel.style.clipPath = "none";
      showInstant();
      return;
    }

    if (skipEnterRef.current) {
      skipEnterRef.current = false;
      showInstant();
      return;
    }

    if (content) {
      content.style.opacity = "0";
      content.style.transform = "scale(0.88)";
    }
    panel.style.clipPath = `circle(${MIN_RADIUS}% at ${CIRCLE_ORIGIN})`;

    const contentDelay = REVEAL_MS * CONTENT_START_RATIO;

    const timeline = createTimeline()
      .add(panel, {
        clipPath: [
          `circle(${MIN_RADIUS}% at ${CIRCLE_ORIGIN})`,
          `circle(${MAX_RADIUS}% at ${CIRCLE_ORIGIN})`,
        ],
        duration: REVEAL_MS,
        ease: "outCubic",
      })
      .add(
        content ?? panel,
        {
          opacity: [0, 1],
          scale: [0.88, 1],
          duration: REVEAL_MS * (1 - CONTENT_START_RATIO),
          ease: "outCubic",
        },
        contentDelay,
      );

    return () => {
      timeline.revert();
    };
  }, [panelRef, activeIndex]);
}
