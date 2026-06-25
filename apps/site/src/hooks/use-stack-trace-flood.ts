import { useEffect, type RefObject } from "react";

interface FloodOptions {
  baseSpeed?: number;
}

export function useStackTraceFlood(
  streamRef: RefObject<HTMLElement | null>,
  sectionRef: RefObject<HTMLElement | null>,
  { baseSpeed = 90 }: FloodOptions = {},
) {
  useEffect(() => {
    const stream = streamRef.current;
    const section = sectionRef.current;
    if (!stream || !section) return;

    const apply = (offset: number) => {
      stream.style.transform = `translate3d(0, ${-offset}px, 0)`;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(0);
      return;
    }

    let offset = 0;
    let frame = 0;
    let last = 0;
    let active = false;

    const maxOffset = () => Math.max(0, stream.scrollHeight - window.innerHeight * 0.42);

    const tick = (now: number) => {
      const max = maxOffset();
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      const progress = max > 0 ? offset / max : 1;
      const taper = Math.pow(1 - progress, 1.7);
      const speed = baseSpeed * (0.16 + 0.84 * taper);
      offset = Math.min(max, offset + speed * dt);
      apply(offset);

      if (active && offset < max) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    const start = () => {
      if (frame || offset >= maxOffset()) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };

    const reset = () => {
      offset = 0;
      apply(0);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            active = true;
            start();
          } else {
            active = false;
            if (frame) cancelAnimationFrame(frame);
            frame = 0;
            if (entry.boundingClientRect.top > 0) reset();
          }
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(section);
    apply(0);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [streamRef, sectionRef, baseSpeed]);
}
