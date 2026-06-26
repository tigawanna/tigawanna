import { useEffect, useRef, useState } from "react";

export function useTechChoicePanel(count: number, options: { enableWheelNav?: boolean } = {}) {
  const { enableWheelNav = true } = options;
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const detailRef = useRef<HTMLDivElement>(null);

  const selectIndex = (index: number) => {
    if (index < 0 || index >= count || index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  useEffect(() => {
    detailRef.current?.scrollTo({ top: 0 });
  }, [activeIndex]);

  useEffect(() => {
    if (!enableWheelNav) return;
    const el = detailRef.current;
    if (!el || count < 2) return;

    const onWheel = (event: WheelEvent) => {
      const fitsWithoutScroll = el.scrollHeight <= el.clientHeight + 2;
      const atTop = el.scrollTop <= 1;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;

      if (event.deltaY > 0 && (fitsWithoutScroll || atBottom) && activeIndex < count - 1) {
        event.preventDefault();
        event.stopPropagation();
        setDirection(1);
        setActiveIndex((index) => index + 1);
        return;
      }

      if (event.deltaY < 0 && (fitsWithoutScroll || atTop) && activeIndex > 0) {
        event.preventDefault();
        event.stopPropagation();
        setDirection(-1);
        setActiveIndex((index) => index - 1);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [activeIndex, count, enableWheelNav]);

  return { activeIndex, direction, selectIndex, detailRef };
}
