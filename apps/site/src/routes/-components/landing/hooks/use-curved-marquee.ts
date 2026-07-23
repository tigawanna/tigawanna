import { useEffect, type RefObject } from "react";

interface CurvedMarqueeOptions {
  repeatCount: number;
  speed?: number;
}

export function useCurvedMarquee(
  ref: RefObject<SVGTextPathElement | null>,
  { repeatCount, speed = 38 }: CurvedMarqueeOptions,
) {
  useEffect(() => {
    const node = ref.current;
    if (!node || repeatCount < 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let offset = 0;
    let last = performance.now();
    let unit = 0;
    let cancelled = false;

    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      offset -= speed * delta;
      if (offset <= -unit) offset += unit;
      node.setAttribute("startOffset", String(offset));
      frame = requestAnimationFrame(tick);
    };

    const init = () => {
      if (cancelled) return;
      unit = node.getComputedTextLength() / repeatCount;
      if (!unit || !Number.isFinite(unit)) {
        frame = requestAnimationFrame(init);
        return;
      }
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(init);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [ref, repeatCount, speed]);
}
