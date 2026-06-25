import { createTimeline } from "animejs";
import { useEffect, useRef } from "react";

import { CREATURE_CURTAIN_PLEATS } from "@/lib/creature-feature/curtain";

interface CreatureCurtainOutroProps {
  onClose: () => void;
}

export function CreatureCurtainOutro({ onClose }: CreatureCurtainOutroProps) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    const content = contentRef.current;
    if (!left || !right || !content) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      left.style.transform = "translateX(0%)";
      right.style.transform = "translateX(0%)";
      content.style.opacity = "1";
      return;
    }

    const timeline = createTimeline();
    timeline
      .add(left, { translateX: ["-101%", "0%"], duration: 1100, ease: "inOutQuart" }, 0)
      .add(right, { translateX: ["101%", "0%"], duration: 1100, ease: "inOutQuart" }, 0)
      .add(content, { opacity: [0, 1], scale: [0.82, 1], duration: 800, ease: "outBack" }, "-=380");

    return () => {
      timeline.revert();
    };
  }, []);

  return (
    <div data-test="creature-curtain-outro" className="fixed inset-0 z-60 overflow-hidden bg-black">
      <div
        ref={leftRef}
        className="absolute inset-y-0 left-0 w-[52%]"
        style={{ background: CREATURE_CURTAIN_PLEATS, transform: "translateX(-101%)" }}
        aria-hidden="true"
      >
        <div className="absolute inset-y-0 right-0 w-10 bg-linear-to-l from-black/55 to-transparent" />
      </div>
      <div
        ref={rightRef}
        className="absolute inset-y-0 right-0 w-[52%]"
        style={{ background: CREATURE_CURTAIN_PLEATS, transform: "translateX(101%)" }}
        aria-hidden="true"
      >
        <div className="absolute inset-y-0 left-0 w-10 bg-linear-to-r from-black/55 to-transparent" />
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/60 to-transparent"
        aria-hidden="true"
      />

      <div
        ref={contentRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-8 px-8 text-center opacity-0"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-[#f6deb0]/45 uppercase">
          // exit code 0
        </p>
        <h2 className="font-serif text-5xl leading-[0.95] font-semibold tracking-[-0.02em] text-[#f6deb0] italic md:text-8xl">
          That&apos;s all, folks!
        </h2>
        <button
          type="button"
          data-test="creature-curtain-close"
          onClick={onClose}
          className="pointer-events-auto rounded-full border border-[#f6deb0]/25 bg-black/40 px-6 py-3 text-xs tracking-[0.22em] text-[#f6deb0]/80 uppercase backdrop-blur transition-colors hover:border-[#f6deb0]/60 hover:text-[#f6deb0]"
        >
          back to shipped work
        </button>
      </div>
    </div>
  );
}
