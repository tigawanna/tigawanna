import { useEffect, type RefObject } from "react";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const circleOrigin = "50% 50%";
const minCircleRadius = 7;
const maxCircleRadius = 108;

function absoluteTop(element: HTMLElement) {
  let offset = 0;
  let node: HTMLElement | null = element;
  while (node) {
    offset += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return offset;
}

export function useStackFacesReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-face-panel]"));
    const contents = panels.map((p) => p.querySelector<HTMLElement>("[data-face-content]"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panels.forEach((p) => p.style.removeProperty("clip-path"));
      contents.forEach((c) => {
        if (c) {
          c.style.opacity = "1";
          c.style.transform = "none";
        }
      });
      return;
    }

    let tops: number[] = [];
    let vh = window.innerHeight;
    let frame = 0;

    const measure = () => {
      vh = window.innerHeight;
      tops = panels.map((p) => absoluteTop(p));
    };

    const update = () => {
      frame = 0;
      const scroll = window.scrollY;

      panels.forEach((panel, index) => {
        if (index === 0) return;

        const panelTop = tops[index];
        const isLast = index === panels.length - 1;
        const enterScroll = panelTop - vh * (isLast ? 0.38 : 0.32);
        const leaveScroll = panelTop + vh * (isLast ? 0.42 : 0.78);
        const range = leaveScroll - enterScroll;
        const raw = range > 0 ? (scroll - enterScroll) / range : 0;
        const circleProgress = clamp(raw, 0, 1);
        const radius = minCircleRadius + circleProgress * maxCircleRadius;
        panel.style.clipPath = `circle(${radius}% at ${circleOrigin})`;

        const content = contents[index];
        if (content) {
          const contentStart = isLast ? 0.38 : 0.48;
          const contentRaw =
            range > 0
              ? (scroll - (enterScroll + range * contentStart)) / (range * (1 - contentStart))
              : 0;
          const contentProgress = clamp(contentRaw, 0, 1);
          const ease = 1 - Math.pow(1 - contentProgress, 3);
          content.style.opacity = String(ease);
          content.style.transform = `scale(${0.88 + 0.12 * ease})`;
        }

        if (isLast && scroll >= leaveScroll) {
          panel.style.clipPath = `circle(${maxCircleRadius}% at ${circleOrigin})`;
          if (content) {
            content.style.opacity = "1";
            content.style.transform = "scale(1)";
          }
        }
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [ref]);
}
