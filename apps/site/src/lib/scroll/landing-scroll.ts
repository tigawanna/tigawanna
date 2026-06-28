import type Lenis from "lenis";

type ScrollListener = (scrollY: number) => void;

const listeners = new Set<ScrollListener>();

let lenisInstance: Lenis | null = null;

function emit(scrollY: number) {
  for (const listener of listeners) {
    listener(scrollY);
  }
}

export function registerLenis(instance: Lenis) {
  lenisInstance = instance;
  instance.on("scroll", () => {
    emit(window.scrollY);
  });
}

export function unregisterLenis() {
  lenisInstance = null;
}

export function subscribeScroll(listener: ScrollListener) {
  listeners.add(listener);
  listener(window.scrollY);

  const onNativeScroll = () => {
    emit(window.scrollY);
  };

  window.addEventListener("scroll", onNativeScroll, { passive: true });

  return () => {
    listeners.delete(listener);
    window.removeEventListener("scroll", onNativeScroll);
  };
}

export function requestScrollResize() {
  lenisInstance?.resize();
}

export function observeLandingScrollResize(target: Element | null) {
  if (!target || typeof ResizeObserver === "undefined") return () => {};

  const observer = new ResizeObserver(() => {
    requestScrollResize();
  });

  observer.observe(target);

  return () => {
    observer.disconnect();
  };
}
