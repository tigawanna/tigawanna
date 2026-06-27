import Lenis from "lenis";
import { useEffect } from "react";

const IDLE_TIMEOUT_MS = 4000;

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lenis: Lenis | null = null;
    let rafId = 0;
    let disposed = false;
    let idleCallbackId = 0;
    let idleTimeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;

    function startLenis() {
      if (disposed || lenis) return;

      lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
      });

      document.documentElement.classList.add("lenis");

      function raf(time: number) {
        if (!lenis) return;
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);
    }

    function onUserScroll() {
      startLenis();
    }

    if ("requestIdleCallback" in window) {
      idleCallbackId = window.requestIdleCallback(() => startLenis(), { timeout: IDLE_TIMEOUT_MS });
    } else {
      idleTimeoutId = globalThis.setTimeout(startLenis, IDLE_TIMEOUT_MS);
    }

    window.addEventListener("wheel", onUserScroll, { passive: true, once: true });
    window.addEventListener("touchstart", onUserScroll, { passive: true, once: true });
    window.addEventListener("scroll", onUserScroll, { passive: true, once: true });

    return () => {
      disposed = true;

      if (idleCallbackId) {
        window.cancelIdleCallback(idleCallbackId);
      }

      if (idleTimeoutId) {
        globalThis.clearTimeout(idleTimeoutId);
      }

      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchstart", onUserScroll);
      window.removeEventListener("scroll", onUserScroll);

      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
      document.documentElement.classList.remove("lenis");
    };
  }, []);

  return null;
}
