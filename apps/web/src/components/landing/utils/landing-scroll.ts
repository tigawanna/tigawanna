type ScrollListener = (scrollY: number) => void;

const listeners = new Set<ScrollListener>();

function emit(scrollY: number) {
  for (const listener of listeners) {
    listener(scrollY);
  }
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

export function observeLayoutResize(target: Element | null, onResize: () => void) {
  if (!target || typeof ResizeObserver === "undefined") return () => {};

  const observer = new ResizeObserver(onResize);
  observer.observe(target);

  return () => {
    observer.disconnect();
  };
}

/**
 * Scrolls an overflow container by `deltaY` without `scrollIntoView` (which also
 * moves the window). Incomplete DOM runtimes omit `scrollBy`/`scrollTo`; those
 * must not throw — React 19 surfaces effect errors as a full-page crash.
 */
export function scrollOverflowBy(element: HTMLElement, deltaY: number, behavior: ScrollBehavior) {
  const nextTop = element.scrollTop + deltaY;

  try {
    if (typeof element.scrollTo === "function") {
      element.scrollTo({ top: nextTop, behavior });
      return;
    }
  } catch {
    // Fall through to assigning scrollTop.
  }

  element.scrollTop = nextTop;
}
