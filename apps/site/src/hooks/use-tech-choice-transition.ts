import { animate } from "animejs";
import { useEffect, type RefObject } from "react";

type TechChoiceHinge = "left" | "right" | "center";

const hingeOrigins: Record<TechChoiceHinge, string> = {
  left: "left center",
  right: "right center",
  center: "center center",
};

export function useTechChoiceTransition(
  panelRef: RefObject<HTMLElement | null>,
  activeIndex: number,
  direction: 1 | -1,
  hinge: TechChoiceHinge = "right",
) {
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panel.style.opacity = "1";
      panel.style.transform = "none";
      return;
    }

    const foldAngle = direction > 0 ? 78 : -78;

    panel.style.transformOrigin = hingeOrigins[hinge];
    panel.style.backfaceVisibility = "hidden";

    const anim = animate(panel, {
      rotateY: [foldAngle, 0],
      scaleX: [0.92, 1],
      opacity: [0.18, 1],
      duration: 980,
      ease: "outQuart",
    });

    return () => {
      anim.revert();
    };
  }, [panelRef, activeIndex, direction, hinge]);
}
