import { useEffect, useRef, type RefObject } from "react";

type TechChoiceScrollLockOptions = {
  sectionRef: RefObject<HTMLElement | null>;
  allVisited: boolean;
  onStepNext: () => void;
};

function isSectionEngaged(section: HTMLElement) {
  const rect = section.getBoundingClientRect();
  const viewHeight = window.innerHeight;
  const visibleHeight = Math.max(0, Math.min(rect.bottom, viewHeight) - Math.max(rect.top, 0));
  const coverage = visibleHeight / viewHeight;
  const anchoredNearTop = rect.top <= 72;

  return anchoredNearTop && coverage >= 0.82;
}

function getScrollableAncestor(node: HTMLElement | null, root: HTMLElement) {
  let current = node;

  while (current && current !== root) {
    const { overflowY } = window.getComputedStyle(current);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      current.scrollHeight > current.clientHeight + 1
    ) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
}

function canScrollDown(element: HTMLElement) {
  return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
}

export function useTechChoiceScrollLock({
  sectionRef,
  allVisited,
  onStepNext,
}: TechChoiceScrollLockOptions) {
  const allVisitedRef = useRef(allVisited);
  const onStepNextRef = useRef(onStepNext);

  allVisitedRef.current = allVisited;
  onStepNextRef.current = onStepNext;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const lg = window.matchMedia("(min-width: 1024px)");
    if (!lg.matches) return;

    const onWheel = (event: WheelEvent) => {
      if (!lg.matches || !sectionRef.current) return;
      if (event.deltaY <= 0) return;
      if (!isSectionEngaged(sectionRef.current)) return;
      if (allVisitedRef.current) return;

      const target = event.target instanceof HTMLElement ? event.target : null;
      const scrollable = getScrollableAncestor(target, sectionRef.current);

      if (scrollable && canScrollDown(scrollable)) return;

      event.preventDefault();
      event.stopPropagation();
      onStepNextRef.current();
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });

    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
    };
  }, [sectionRef]);
}
