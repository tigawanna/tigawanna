import { useEffect, type RefObject } from "react";

type CurvedTarget = {
  inner: HTMLElement | null;
  content: HTMLElement | null;
  number: HTMLElement | null;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function absoluteTop(element: HTMLElement | null) {
  let offset = 0;
  let node: HTMLElement | null = element;
  while (node) {
    offset += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return offset;
}

export function useCurvedSectionsMotion(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-curved-section]"));
    const targets: CurvedTarget[] = panels.map((panel) => ({
      inner: panel.querySelector<HTMLElement>("[data-curved-inner]"),
      content: panel.querySelector<HTMLElement>("[data-curved-content]"),
      number: panel.querySelector<HTMLElement>("[data-curved-number]"),
    }));

    let tops: number[] = [];
    let panelHeight = window.innerHeight;
    let frame = 0;

    const measure = () => {
      panelHeight = panels[0]?.offsetHeight || window.innerHeight;
      tops = panels.map((panel) => absoluteTop(panel));
    };

    const update = () => {
      frame = 0;
      const scroll = window.scrollY;

      targets.forEach((target, index) => {
        const progress = (scroll - tops[index]) / panelHeight;
        const rise = clamp(progress + 1, 0, 1);
        const cover = index < targets.length - 1 ? clamp(progress, 0, 1) : 0;

        if (target.content) {
          const reveal = clamp(rise / 0.6, 0, 1);
          target.content.style.opacity = String(reveal);
          target.content.style.transform = `translateY(${(1 - reveal) * 56}px)`;
        }

        if (target.number) {
          const parallax = clamp(progress, -1, 1);
          const translate = 12 - (parallax + 1) * 17;
          target.number.style.transform = `translateY(${translate}%)`;
        }

        if (target.inner) {
          target.inner.style.opacity = String(1 - cover * 0.8);
          target.inner.style.transform = `translateY(${-52 * cover}px) scale(${1 - 0.07 * cover})`;
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
