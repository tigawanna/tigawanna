import { stackProseSegments } from "@/config/info";
import { animate, onScroll } from "animejs";
import { useEffect, useRef } from "react";
import { CubeVisual } from "./CubeVisual";
import { EditorialMobileSection } from "./EditorialMobileSection";
import { FlowingProse } from "./FlowingProse";

export function StackCubeMobile() {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panel.style.opacity = "1";
      panel.style.transform = "none";
      return;
    }

    const anim = animate(panel, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 800,
      ease: "outQuart",
      autoplay: onScroll({
        target: panel,
        enter: "top 88%",
        leave: "top",
        sync: false,
        repeat: false,
      }),
    });

    const frame = requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        anim.revert();
        animate(panel, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 800,
          ease: "outQuart",
        });
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      anim.revert();
    };
  }, []);

  return (
    <div data-test="stack-cube-mobile">
      <div className="relative bg-[#1a1a15] px-6 py-16 text-[#c5ccb4] sm:px-8 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(104,112,84,0.1),transparent_50%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center">
          <div className="mt-10 flex justify-center">
            <div className="cube-stage cube-stage--compact">
              <CubeVisual />
            </div>
          </div>
        </div>
      </div>

      <div ref={panelRef} className="opacity-0">
        <EditorialMobileSection
          title="What I build with"
          tone="olive"
          showDivider
          dataTest="stack-cube-prose"
        >
          <FlowingProse segments={stackProseSegments} />
        </EditorialMobileSection>
      </div>
    </div>
  );
}
