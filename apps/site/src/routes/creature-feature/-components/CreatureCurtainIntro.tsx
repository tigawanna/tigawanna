import { createTimeline } from "animejs";
import { useEffect, useRef } from "react";

import { CREATURE_CURTAIN_PLEATS } from "@/modules/creature-feature/curtain";
interface CreatureCurtainIntroProps {
  onComplete: () => void;
}

export function CreatureCurtainIntro({ onComplete }: CreatureCurtainIntroProps) {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    const flash = flashRef.current;
    if (!left || !right || !flash) return;

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }

    const timeline = createTimeline({
      onComplete: finish,
    });

    timeline
      .add(flash, { opacity: [0, 0.75, 0], duration: 700, ease: "outQuad" }, 0)
      .add(left, { translateX: ["0%", "-101%"], duration: 2400, ease: "inOutQuart" }, 420)
      .add(right, { translateX: ["0%", "101%"], duration: 2400, ease: "inOutQuart" }, 420);

    return () => {
      timeline.revert();
    };
  }, [onComplete]);

  return (
    <div
      data-test="creature-curtain-intro"
      className="fixed inset-0 z-80 overflow-hidden bg-[#050505]"
      aria-hidden="true"
    >
      <div ref={flashRef} className="pointer-events-none absolute inset-0 bg-[#ff5b51] opacity-0" />

      <div
        ref={leftRef}
        className="absolute inset-y-0 left-0 w-[52%]"
        style={{ background: CREATURE_CURTAIN_PLEATS, transform: "translateX(0%)" }}
      >
        <div className="absolute inset-y-0 right-0 w-10 bg-linear-to-l from-black/55 to-transparent" />
      </div>
      <div
        ref={rightRef}
        className="absolute inset-y-0 right-0 w-[52%]"
        style={{ background: CREATURE_CURTAIN_PLEATS, transform: "translateX(0%)" }}
      >
        <div className="absolute inset-y-0 left-0 w-10 bg-linear-to-r from-black/55 to-transparent" />
      </div>
    </div>
  );
}
