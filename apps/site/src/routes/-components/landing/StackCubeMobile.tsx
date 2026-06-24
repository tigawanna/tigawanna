import { stackCubeFaces } from "@/config/info";
import { animate, onScroll, stagger } from "animejs";
import { useEffect, useRef } from "react";
import { CubeVisual } from "./CubeVisual";
import { EditorialMobileSection, editorialToneForIndex } from "./EditorialMobileSection";

export function StackCubeMobile() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const items = list.querySelectorAll<HTMLElement>("[data-stack-face]");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "none";
      });
      return;
    }

    const anim = animate(items, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 700,
      delay: stagger(80, { start: 100 }),
      ease: "outQuart",
      autoplay: onScroll({
        target: list,
        enter: "top 88%",
        leave: "top",
        sync: false,
        repeat: false,
      }),
    });

    const frame = requestAnimationFrame(() => {
      const rect = list.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        anim.revert();
        animate(items, {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 700,
          delay: stagger(80, { start: 100 }),
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
          <p className="font-serif text-3xl font-medium tracking-[-0.03em] text-[#c5ccb4]/90 sm:text-4xl">
            What I build with
          </p>

          <div className="mt-10 flex justify-center">
            <div className="cube-stage cube-stage--compact">
              <CubeVisual />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            {stackCubeFaces.map((face, index) => (
              <div key={face.label} className="flex items-center gap-2">
                {index > 0 && <div className="h-px w-3 bg-[#c5ccb4]/30" />}
                <span className="text-[9px] tracking-[0.25em] text-[#c5ccb4]/35 uppercase">
                  {face.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div ref={listRef}>
        {stackCubeFaces.map((face, index) => (
          <div key={face.label} data-stack-face className="opacity-0">
            <EditorialMobileSection
              title={face.label}
              tone={editorialToneForIndex(index)}
              showDivider
              dataTest={`stack-cube-face-${face.label.toLowerCase()}`}
            >
              <p className="mx-auto max-w-md text-center font-serif text-sm leading-7 text-[#c5ccb4]/45 sm:text-base sm:leading-8">
                {face.techs.join(", ")}
              </p>
            </EditorialMobileSection>
          </div>
        ))}
      </div>
    </div>
  );
}
