import { useEffect, useRef, type RefObject } from "react";

interface FloodOptions {
  baseSpeed?: number;
  maxDurationMs?: number;
  onComplete?: () => void;
}

export function useStackTraceFlood(
  streamRef: RefObject<HTMLElement | null>,
  sectionRef: RefObject<HTMLElement | null>,
  { baseSpeed = 150, maxDurationMs = 8000, onComplete }: FloodOptions = {},
) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const stream = streamRef.current;
    const section = sectionRef.current;
    if (!stream || !section) return;

    let completed = false;
    const apply = (offset: number) => {
      stream.style.transform = `translate3d(0, ${-offset}px, 0)`;
    };

    const complete = () => {
      if (completed) return;
      completed = true;
      onCompleteRef.current?.();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(0);
      window.setTimeout(complete, 2600);
      return;
    }

    let offset = 0;
    let frame = 0;
    let last = 0;
    let active = false;
    let startedAt = 0;

    const maxOffset = () => Math.max(0, stream.scrollHeight - window.innerHeight * 0.42);

    const tick = (now: number) => {
      if (!startedAt) startedAt = now;
      const max = maxOffset();
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      const progress = max > 0 ? offset / max : 1;
      const taper = Math.pow(1 - progress, 1.4);
      const speed = baseSpeed * (0.4 + 0.6 * taper);
      offset = Math.min(max, offset + speed * dt);
      apply(offset);

      const timeUp = now - startedAt >= maxDurationMs;

      if (active && offset < max && !timeUp) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
        if (offset >= max || timeUp) window.setTimeout(complete, 600);
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
  }, [streamRef, sectionRef, baseSpeed, maxDurationMs]);
}
