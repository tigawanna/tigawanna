import Lenis from "lenis";
import {
  observeLandingScrollResize,
  registerLenis,
  requestScrollResize,
  unregisterLenis,
} from "@/lib/scroll/landing-scroll";
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
    let unobserveBody: (() => void) | undefined;

    function startLenis() {
      if (disposed || lenis) return;

      lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true,
      });

      registerLenis(lenis);
      document.documentElement.classList.add("lenis");
      requestScrollResize();

      unobserveBody = observeLandingScrollResize(document.body);

      const main = document.getElementById("main-content");
      if (main) {
        const unobserveMain = observeLandingScrollResize(main);
        const previousUnobserveBody = unobserveBody;
        unobserveBody = () => {
          previousUnobserveBody?.();
          unobserveMain();
        };
      }

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

    function onLoad() {
      requestScrollResize();
    }

    if ("requestIdleCallback" in window) {
      idleCallbackId = window.requestIdleCallback(() => startLenis(), { timeout: IDLE_TIMEOUT_MS });
    } else {
      idleTimeoutId = globalThis.setTimeout(startLenis, IDLE_TIMEOUT_MS);
    }

    window.addEventListener("wheel", onUserScroll, { passive: true, once: true });
    window.addEventListener("touchstart", onUserScroll, { passive: true, once: true });
    window.addEventListener("scroll", onUserScroll, { passive: true, once: true });
    window.addEventListener("load", onLoad);

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
      window.removeEventListener("load", onLoad);

      unobserveBody?.();

      if (rafId) cancelAnimationFrame(rafId);
      unregisterLenis();
      lenis?.destroy();
      document.documentElement.classList.remove("lenis");
    };
  }, []);

  return null;
}
